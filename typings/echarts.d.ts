declare module 'echarts' {
  export interface EChartsOption {
    title?: any;
    tooltip?: any;
    xAxis?: any;
    yAxis?: any;
    series?: any[];
    legend?: any;
    grid?: any;
    dataZoom?: any;
  }

  export function init(dom: HTMLElement, theme?: string, opts?: any): EChartsInstance;

  export interface EChartsInstance {
    setOption(option: EChartsOption): void;
    resize(opts?: any): void;
    dispose(): void;
  }

  export function use(module: any): void;
  export default {
    init,
    use
  };
}
