/* As of nivo 0.99, theme types live in '@nivo/theming' rather than '@nivo/core'.  The type accepted
   by a chart's "theme" prop is 'PartialTheme'; 'Theme' now denotes a fully resolved theme. */
import { type PartialTheme } from '@nivo/theming';

export const THEME: PartialTheme = {
  annotations: {
    link: {
      outlineColor: '#ffffff',
      outlineOpacity: 1,
      outlineWidth: 2,
      stroke: '#000000',
      strokeWidth: 1,
    },
    outline: {
      outlineColor: '#ffffff',
      outlineOpacity: 1,
      outlineWidth: 2,
      stroke: '#000000',
      strokeWidth: 2,
    },
    symbol: {
      fill: '#000000',
      outlineColor: '#ffffff',
      outlineOpacity: 1,
      outlineWidth: 2,
    },
    text: {
      fill: '#333333',
      fontSize: 13,
      outlineColor: '#ffffff',
      outlineOpacity: 1,
      outlineWidth: 2,
    },
  },
  axis: {
    domain: {
      line: {
        stroke: '#777777',
        strokeWidth: 1,
      },
    },
    legend: {
      text: {
        fill: '#333333',
        fontSize: 10,
        outlineColor: 'transparent',
        outlineWidth: 0,
      },
    },
    ticks: {
      line: {
        stroke: '#777777',
        strokeWidth: 1,
      },
      text: {
        fill: '#333333',
        fontSize: 10,
        outlineColor: 'transparent',
        outlineWidth: 0,
      },
    },
  },
  background: 'transparent',
  grid: {
    line: {
      stroke: '#F1F3F5',
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: '#333333',
      fontSize: 11,
      outlineColor: 'transparent',
      outlineWidth: 0,
    },
    ticks: {
      line: {},
      text: {
        fill: '#333333',
        fontSize: 10,
        outlineColor: 'transparent',
        outlineWidth: 0,
      },
    },
    title: {
      text: {
        fill: '#333333',
        fontSize: 11,
        outlineColor: 'transparent',
        outlineWidth: 0,
      },
    },
  },
  text: {
    fill: '#333333',
    fontSize: 11,
    outlineColor: 'transparent',
    outlineWidth: 0,
  },
  tooltip: {
    basic: {},
    chip: {},
    container: {
      background: '#ffffff',
      fontSize: 12,
      zIndex: 1000,
    },
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
};
