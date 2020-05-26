import {extent, max} from 'd3-array';
import {axisLeft} from 'd3-axis';
import {scaleBand, scaleLinear} from 'd3-scale';
import {select} from 'd3-selection';
import {memo, useEffect, useMemo, useRef, useState} from 'react';
import {DataPoint} from '../types';
import {formatNumNice} from '../utils/format';
import {useRenderOnResize} from './use-render-on-resize';

interface Props {
  data: DataPoint[];
}

let HIDE_AFTER = 100;
let CHART_PADDING = 10;
let Y_AXIS_PADDING = 5;
let X_AXIS_PADDING = 5;
let MAX_BAR_WIDTH = 40;

export const AnalysisChart = memo(function Histogram(props: Props) {
  const {data} = props;

  const [showAll, setShowAll] = useState(false);

  const rootRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gridRef = useRef();
  const rect = useRenderOnResize(rootRef);

  const rows = useMemo(() => {
    return showAll ? data : data.slice(0, HIDE_AFTER);
  }, [data, showAll]);

  useEffect(() => {
    const $root = select(rootRef.current);
    const $xAxis = select(xAxisRef.current);
    const $yAxis = select(yAxisRef.current);
    const $grid = select(gridRef.current);

    let elRect = rect || (rootRef.current as HTMLElement).getBoundingClientRect();
    const width = elRect.width;
    const height = elRect.height;

    const xLabels = rows.map((d) => d.label);
    const maxLabelChars = max(xLabels, (d) => d.length);
    const rotateLabels = maxLabelChars * 9 * xLabels.length > 400;
    const xTickLineHeight = 15;
    const xAxisHeight = rotateLabels ? Math.min(maxLabelChars * 6, 100) : xTickLineHeight;

    const gridHeight = height - xAxisHeight - X_AXIS_PADDING - CHART_PADDING;

    ///////////////////
    // Render Y-axis //
    ///////////////////
    const yExtent = extent(rows, (d) => d.value);
    const yScale = scaleLinear()
      .nice()
      .domain([0, Math.ceil(yExtent[1] * 1.1)])
      .range([0, gridHeight]);
    const yAxisScale = yScale.copy().range([gridHeight, 0]);

    const yAxisGen = axisLeft(yAxisScale)
      .ticks(4)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickPadding(0)
      .tickFormat((d) => formatNumNice(d));

    // First render the axis normally
    $yAxis
      .selectAll('g.axis')
      .data([rows])
      .join(
        (enter) => enter.append('g').classed('axis', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .call(yAxisGen);

    const yAxisTextWidth = Math.ceil($yAxis.select('g.axis').node().getBoundingClientRect().width);
    $yAxis.select('g.axis').attr('transform', `translate(${yAxisTextWidth}, 0)`);

    const yAxisWidth = yAxisTextWidth + CHART_PADDING + Y_AXIS_PADDING;
    $yAxis.style('width', `${yAxisWidth}px`).style('height', `${gridHeight}px`);
    $root.select('.scroll').style('padding-left', `${yAxisWidth}px`);

    // Render line
    $yAxis
      .selectAll('.y-line')
      .data([1])
      .join(
        (enter) => {
          return enter.append('line').classed('y-line', true).attr('stroke', 'currentColor');
        },
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr('y1', 0)
      .attr('y2', gridHeight)
      .attr('x1', yAxisTextWidth + Y_AXIS_PADDING)
      .attr('x2', yAxisTextWidth + Y_AXIS_PADDING);

    ///////////////////
    // Render X-axis //
    ///////////////////

    const xTickWidth = rotateLabels ? 25 : maxLabelChars * 9;
    const gridWidth = Math.max(width - yAxisWidth, xLabels.length * xTickWidth);

    const xScale = scaleBand()
      .domain(xLabels)
      .range([0, gridWidth])
      .paddingInner(0.1)
      .paddingOuter(0.1);

    $xAxis
      .classed('x-rotate', rotateLabels)
      .style('width', `${gridWidth}px`)
      .style('height', `${xAxisHeight}px`);
    const $xTicks = $xAxis
      .selectAll('.x-tick')
      .data(xLabels)
      .join(
        (enter) => enter.append('div').classed('x-tick', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .text((d) => (d === '' ? '[empty]' : d));

    let bandwidth = xScale.bandwidth();
    if (rotateLabels) {
      let xTickOffset = Math.ceil(bandwidth / 2 + 2);
      $xTicks.style('width', `${xAxisHeight * 1.2}px`).style('right', (d) => {
        return `${gridWidth - xScale(d) - xTickOffset}px`;
      });
    } else {
      $xTicks
        .style('width', `${bandwidth}px`)
        .style('top', '4px')
        .style('left', (d) => `${xScale(d)}px`);
    }

    $grid
      .style('width', `${gridWidth}px`)
      .style('height', `${gridHeight}px`)
      .selectAll('g.y-lines')
      .data([1])
      .join(
        (enter) => enter.append('g').classed('y-lines', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .call(yAxisGen.tickSizeOuter(1).tickSizeInner(-gridWidth));

    /////////////////
    // Render Bars //
    /////////////////

    let barWidth = bandwidth;
    let xBarOffset = 0;
    if (barWidth > MAX_BAR_WIDTH) {
      barWidth = MAX_BAR_WIDTH;
      xBarOffset = Math.floor((bandwidth - barWidth) / 2);
    }

    $grid
      .selectAll('.bar')
      .data(rows)
      .join(
        (enter) => enter.append('rect').classed('bar', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr('x', (d) => xScale(d.label) + xBarOffset)
      .attr('y', (d) => gridHeight - yScale(d.value))
      .attr('width', barWidth)
      .attr('height', (d) => yScale(d.value));
  }, [rect, rows]);

  let nRows = data.length;
  let hiddenRows = nRows - HIDE_AFTER;

  return (
    <div className="root" ref={rootRef}>
      <svg className="axis axis-y" ref={yAxisRef} />
      <div className="scroll">
        <div className="scroll-chart">
          <svg className="grid" ref={gridRef} />
          <div className="axis axis-x" ref={xAxisRef} />
        </div>
        {nRows > HIDE_AFTER && !showAll && (
          <div className="show-all">
            <button className="show-all-btn" onClick={() => setShowAll(true)}>
              Show {hiddenRows} more value{hiddenRows === 1 ? '' : 's'}
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        .root {
          flex: 1 0 auto;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          max-height: 100%;
          overflow: hidden;
        }
        .axis-y {
          position: absolute;
          background: #fff;
          min-width: 10px;
          color: var(--n4);
          padding: 0 5px 0 10px;
          overflow: visible;
          z-index: 2;
        }
        .axis-y :global(.domain),
        .axis-y :global(.tick line) {
          display: none;
        }
        .axis-y :global(text) {
          color: var(--n7);
        }
        .scroll {
          flex: 1 1 0;
          overflow-x: auto;
          display: flex;
          align-items: flex-start;
        }
        .scroll-chart {
          min-width: 100%;
          flex: 1 0 auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          min-width: 0;
        }

        .axis-x {
          position: relative;
          overflow: visible;
          flex: 0 0 auto;
          padding-top: 5px;
        }

        :global(.x-tick) {
          font-size: 12px;
          height: 15px;
          line-height: 15px;
          position: absolute;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
        :global(.x-rotate .x-tick) {
          text-align: right;
          transform-origin: center right;
          transform: rotate(-45deg) translateY(-50%);
        }

        .show-all {
          width: 110px;
          height: 90%;
          display: flex;
          align-items: center;
          justify-content: stretch;
          flex: 0 0 auto;
        }
        .show-all-btn {
          border: none;
          background: transparent;
          color: var(--b9);
          cursor: pointer;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          line-height: 1;
          outline: none;
          padding: 10px;
          border-radius: 3px;
          transition: 0.3s color;
          width: 100%;
        }
        .show-all-btn:hover {
          color: var(--b7);
        }

        :global(.y-lines) {
          color: var(--n4);
        }
        :global(.y-lines text),
        :global(.y-lines .domain) {
          display: none;
        }
        .grid {
          flex: 1 1 auto;
          overflow: visible;
        }

        :global(.bar) {
          fill: var(--b9);
        }
      `}</style>
    </div>
  );
});
