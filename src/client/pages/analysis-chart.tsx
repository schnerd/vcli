import {extent, max} from 'd3-array';
import {axisLeft} from 'd3-axis';
import {scaleBand, scaleLinear, ScaleBand} from 'd3-scale';
import {select, Selection as D3Selection} from 'd3-selection';
import {memo, useEffect, useMemo, useRef, useState} from 'react';
import {ChartFieldsMeta, DataPoint, DataTypes, DateAggType} from '../types';
import {formatNumNice} from '../utils/format';
import {useRenderOnResize} from './use-render-on-resize';

interface Props {
  data: DataPoint[];
  fields: ChartFieldsMeta;
}

const HIDE_AFTER = 100;
const CHART_PADDING = 10;
const Y_AXIS_PADDING = 5;
const X_AXIS_PADDING = 5;
const MAX_BAR_WIDTH = 40;

interface XAxis {
  getBarWidth(): number;
  getBarX(d: DataPoint): number;
  getGridWidth(): number;
  getHeight(): number;
  setMinWidth(value: number): void;
  render();
}

type Selection = D3Selection<any, any, any, any>;

class OrdinalXAxis implements XAxis {
  $xAxis: Selection;
  numBars: number;
  rotateLabels: boolean;
  labels: string[];
  maxLabelChars: number;
  axisHeight: number;
  tickLineHeight = 15;
  tickWidth: number;
  minWidth: number = null;
  gridWidth = 0;
  barWidth = 0;
  barOffset = 0;
  scale!: ScaleBand<any>;

  constructor(args: {rows: DataPoint[]; $xAxis: Selection}) {
    const {rows, $xAxis} = args;
    this.$xAxis = $xAxis;
    this.labels = rows.map((d) => String(d.label));
    this.numBars = this.labels.length;
    this.maxLabelChars = max(this.labels, (d) => String(d).length);
    this.rotateLabels = this.maxLabelChars * 9 * this.numBars > 400;
    this.axisHeight = this.rotateLabels
      ? Math.min(this.maxLabelChars * 6, 100)
      : this.tickLineHeight;
    this.tickWidth = this.rotateLabels ? 25 : this.maxLabelChars * 9;
  }

  getBarWidth() {
    return this.barWidth;
  }

  getBarX = (d: DataPoint) => {
    return this.scale(d.label as any) + this.barOffset;
  };

  getGridWidth() {
    return this.gridWidth;
  }

  getHeight() {
    return this.axisHeight;
  }

  setMinWidth(value: number) {
    this.minWidth = value;
  }

  render() {
    if (this.minWidth === null) {
      throw new Error('Invariant: min width not set before rendering');
    }
    this.gridWidth = Math.max(this.minWidth, this.numBars * this.tickWidth);

    this.scale = scaleBand()
      .domain(this.labels)
      .range([0, this.gridWidth])
      .paddingInner(0.1)
      .paddingOuter(0.1);

    // Set bar width/offset
    const bandwidth = this.scale.bandwidth();
    this.barWidth = bandwidth;
    this.barOffset = 0;
    if (this.barWidth > MAX_BAR_WIDTH) {
      this.barWidth = MAX_BAR_WIDTH;
      this.barOffset = Math.floor((bandwidth - this.barWidth) / 2);
    }

    this.$xAxis
      .classed('x-rotate', this.rotateLabels)
      .style('width', `${this.gridWidth}px`)
      .style('height', `${this.axisHeight}px`);
    const $xTicks = this.$xAxis
      .selectAll('.x-tick')
      .data(this.labels)
      .join(
        (enter) => enter.append('div').classed('x-tick', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .text((d) => (d === '' ? '[empty]' : d));

    if (this.rotateLabels) {
      const xTickOffset = Math.ceil(bandwidth / 2 + 2);
      $xTicks
        .style('width', `${this.axisHeight * 1.2}px`)
        .style('right', (d) => {
          return `${this.gridWidth - this.scale(d) - xTickOffset}px`;
        })
        .style('left', null)
        .style('top', null);
    } else {
      $xTicks
        .style('width', `${bandwidth}px`)
        .style('top', '4px')
        .style('left', (d) => `${this.scale(d)}px`)
        .style('right', null);
    }
  }
}

export const AnalysisChart = memo(function (props: Props) {
  const {data, fields} = props;

  const [showAll, setShowAll] = useState(false);

  const rootRef = useRef();
  const xAxisRef = useRef();
  const yAxisRef = useRef();
  const gridRef = useRef();
  const rect = useRenderOnResize(rootRef);

  const rows = useMemo(() => {
    return showAll ? data : data.slice(0, HIDE_AFTER);
  }, [data, showAll]);

  const xIsDate = fields.x.type === DataTypes.date;
  const dateAgg = fields.x.dateAgg as DateAggType;

  useEffect(() => {
    const $root = select(rootRef.current);
    const $xAxis = select(xAxisRef.current);
    const $yAxis = select(yAxisRef.current);
    const $grid = select(gridRef.current);

    const elRect = rect || (rootRef.current as HTMLElement).getBoundingClientRect();
    const width = elRect.width;
    const height = elRect.height;

    const xAxis: XAxis = new OrdinalXAxis({rows, $xAxis});

    const gridHeight = height - xAxis.getHeight() - X_AXIS_PADDING - CHART_PADDING;

    /* Render Y-axis */
    const yExtent = extent(rows, (d) => d.value);
    const yMin = yExtent[0];
    const yMax = yExtent[1];

    const yScaleMin = yMin < 0 ? Math.floor(yMin * 1.1) : 0;
    let yScaleMax = yMax < 0 ? 0 : Math.ceil(yMax * 1.1);
    if (yScaleMax === 0 && yScaleMin === 0) {
      yScaleMax = 1;
    }

    const yScale = scaleLinear().nice().domain([yScaleMin, yScaleMax]).range([0, gridHeight]);
    const yAxisScale = yScale.copy().range([gridHeight, 0]);

    const yAxisGen = axisLeft(yAxisScale)
      .ticks(4)
      .tickSizeOuter(0)
      .tickSizeInner(0)
      .tickPadding(0)
      .tickFormat((d) => formatNumNice(d as number));

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

    const yAxisTextWidth = Math.ceil(
      ($yAxis.select('g.axis').node() as HTMLElement).getBoundingClientRect().width,
    );
    $yAxis.select('g.axis').attr('transform', `translate(${yAxisTextWidth}, 0)`);

    const yAxisWidth = yAxisTextWidth + CHART_PADDING + Y_AXIS_PADDING;
    $yAxis.style('width', `${yAxisWidth}px`).style('height', `${gridHeight + 2}px`);
    $root.select('.scroll').style('padding-left', `${yAxisWidth}px`);

    // Render separator line
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

    /* Render X-axis */
    xAxis.setMinWidth(width - yAxisWidth);
    xAxis.render();

    const gridWidth = xAxis.getGridWidth();

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

    /* Render Bars */
    $grid
      .selectAll('.bar')
      .data(rows)
      .join(
        (enter) => enter.append('rect').classed('bar', true),
        (update) => update,
        (exit) => exit.remove(),
      )
      .attr('x', (d) => xAxis.getBarX(d))
      .attr('y', (d) => {
        if (d.value >= 0) {
          return gridHeight - yScale(d.value);
        }
        return gridHeight - yScale(0);
      })
      .attr('width', xAxis.getBarWidth())
      .attr('height', (d) => {
        return Math.abs(yScale(d.value) - yScale(0));
      });
  }, [rect, rows, xIsDate, dateAgg]);

  const nRows = data.length;
  const hiddenRows = nRows - HIDE_AFTER;

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
          margin-top: 16px;
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
