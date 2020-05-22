import {select} from 'd3-selection';
import {scaleLinear, scaleBand} from 'd3-scale';
import {extent, max} from 'd3-array';
import {axisTop, axisLeft} from 'd3-axis';
import {useRef, memo, useEffect} from 'react';
import {useRenderOnResize} from './use-render-on-resize';

interface DataPoint {
  label: string;
  value: number;
}
interface Props {
  data: DataPoint[];
}

function formatNumNice(n) {
  let abbrev;
  if (n >= 1e6) {
    n = n / 1e6;
    abbrev = 'm';
  } else if (n >= 1e3) {
    n = n / 1e3;
    abbrev = 'k';
  }
  return abbrev ? `${n}${abbrev}` : String(n);
}

export const Histogram = memo(function _Histogram(props: Props) {
  const {data} = props;

  const rootRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gridRef = useRef();
  const rect = useRenderOnResize(rootRef);

  useEffect(() => {
    const $root = select(rootRef.current);
    const $xAxis = select(xAxisRef.current);
    const $yAxis = select(yAxisRef.current);
    const $grid = select(gridRef.current);

    let elRect = rect || (rootRef.current as HTMLElement).getBoundingClientRect();
    const width = elRect.width;
    const height = elRect.height;

    // Figure out x content width

    const xLabels = data.map((d) => d.label);
    const maxLabelChars = max(xLabels, (d) => d.length);
    const xAxisWidth = Math.min(maxLabelChars * 9 + 8, 120);

    const yAxisHeight = 14;
    const xTickHeight = 15;

    const gridWidth = width - xAxisWidth;
    const gridHeight = Math.max(height - yAxisHeight, xTickHeight * (xLabels.length + 1));

    // Figure out content height
    const yExtent = extent(data, (d) => d.value);
    const yScale = scaleLinear()
      .domain([0, Math.ceil(yExtent[1] * 1.1)])
      .range([0, gridWidth]);

    const xScale = scaleBand()
      .domain(xLabels)
      .range([0, gridHeight])
      .paddingInner(0.1)
      .paddingOuter(0.1);

    ///////////////////
    // Render Y-axis //
    ///////////////////
    const yAxisGen = axisTop(yScale)
      .ticks(4)
      .tickSizeOuter(0)
      .tickSizeInner(-(height - yAxisHeight))
      .tickPadding(4)
      .tickFormat((d) => formatNumNice(d));

    $yAxis
      .selectAll('g.axis')
      .data([data])
      .join(
        (enter) => {
          let sel = enter.append('g').classed('axis', true);
          enter
            .append('line')
            .classed('y-line', true)
            .attr('stroke', 'currentColor')
            .attr('y1', yAxisHeight - 1)
            .attr('y2', yAxisHeight - 1)
            .attr('x1', 0)
            .attr('x2', width);
          return sel;
        },
        (update) => update,
        (exit) => exit.remove(),
      )
      .call(yAxisGen)
      .attr('transform', `translate(${xAxisWidth},${yAxisHeight})`);

    ///////////////////
    // Render X-axis //
    ///////////////////

    let xTickOffset = Math.ceil(xScale.bandwidth() / 2 - xTickHeight / 2);
    $xAxis.style('width', `${xAxisWidth}px`).style('height', `${gridHeight}px`);
    $xAxis
      .selectAll('.x-tick')
      .data(xLabels)
      .join(
        (enter) => enter.append('div').classed('x-tick', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .text((d) => (d === '' ? '[empty]' : d))
      .style('top', (d) => `${xScale(d) + xTickOffset}px`);

    $grid
      .style('height', `${gridHeight}px`)
      .selectAll('g.y-lines')
      .data([1])
      .join(
        (enter) => enter.append('g').classed('y-lines', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .call(yAxisGen.tickSizeOuter(1).tickSizeInner(-gridHeight));

    /////////////////
    // Render Bars //
    /////////////////

    $grid
      .selectAll('.bar')
      .data(data)
      .join(
        (enter) => enter.append('rect').classed('bar', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr('x', 0)
      .attr('y', (d) => xScale(d.label))
      .attr('width', (d) => yScale(d.value))
      .attr('height', xScale.bandwidth());
  }, [rect, data]);

  return (
    <div className="root" ref={rootRef}>
      <svg className="axis axis-y" ref={yAxisRef} />
      <div className="scroll">
        <div className="axis axis-x" ref={xAxisRef} />
        <svg className="grid" ref={gridRef} />
      </div>
      <style jsx>{`
        .root {
          flex: 1 0 auto;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          max-width: 100%;
        }
        .axis-y {
          width: 100%;
          height: 14px;
          color: var(--n5);
          flex: 0 0 auto;
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
          overflow-y: auto;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          min-width: 0;
        }
        .axis-x {
          position: relative;
          overflow: visible;
          flex: 0 0 auto;
        }
        :global(.x-tick) {
          font-size: 12px;
          height: 15px;
          line-height: 15px;
          position: absolute;
          left: 4px;
          right: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: right;
        }
        :global(.y-lines) {
          color: var(--n5);
        }
        :global(.y-lines text),
        :global(.y-lines .domain) {
          display: none;
        }
        .grid {
          flex: 1 1 auto;
        }

        :global(.bar) {
          fill: var(--b9);
        }
      `}</style>
    </div>
  );
});
