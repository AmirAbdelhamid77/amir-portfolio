import datasetsJson from "@/content/data-viz/datasets.json";

// Typed access to the generated synthetic datasets. The shape of this file is
// asserted by `npm run validate:data-viz`, so the chart code can rely on it.

export interface DatasetBase {
  id: string;
  label: string;
  unit: string;
  kind: string;
  synthetic: true;
  note: string;
}

export interface ContinuousDataset extends DatasetBase {
  values: number[];
}

export interface Group {
  id: string;
  label: string;
}

export interface GroupedDataset extends DatasetBase {
  groups: (Group & { values: number[] })[];
}

export interface ScatterPoint {
  channel: string;
  spend: number;
  signups: number;
}

export interface ScatterDataset extends DatasetBase {
  points: ScatterPoint[];
}

export interface SeriesDataset extends DatasetBase {
  series: (Group & { points: number[] })[];
}

export interface RowDataset extends DatasetBase {
  rows: (Group & { value: number })[];
}

export interface ClinicDataset extends DatasetBase {
  rows: { clinic: string; emergency: number; urgent: number; routine: number }[];
  series: Group[];
}

export interface FunnelDataset extends DatasetBase {
  stages: (Group & { value: number })[];
}

export interface HierarchyNode {
  id: string;
  label: string;
  value?: number;
  children?: HierarchyNode[];
}

export interface HierarchyDataset extends DatasetBase {
  nodes: HierarchyNode[];
}

export interface DualMetricDataset extends DatasetBase {
  rows: { month: string; spend: number; revenue: number }[];
}

export interface LongSeriesDataset extends DatasetBase {
  values: number[];
}

export interface SegmentArm {
  converted: number;
  total: number;
}

export interface SimpsonDataset extends DatasetBase {
  segments: {
    id: string;
    label: string;
    control: SegmentArm;
    treatment: SegmentArm;
  }[];
}

interface DatasetMap {
  "order-values": ContinuousDataset;
  "delivery-times": GroupedDataset;
  "campaign-spend": ScatterDataset;
  "weekly-sessions": SeriesDataset;
  "regional-revenue": RowDataset;
  "clinic-wait": ClinicDataset;
  "hiring-funnel": FunnelDataset;
  "revenue-mix": HierarchyDataset;
  "baseline-bars": RowDataset;
  "dual-metric": DualMetricDataset;
  "channel-mix": RowDataset;
  "same-mean": GroupedDataset;
  "long-series": LongSeriesDataset;
  simpson: SimpsonDataset;
}

interface DatasetsFile {
  meta: {
    synthetic: boolean;
    generatedBy: string;
    seed: number;
    generatedFor: string;
    note: string;
    updated: string;
  };
  datasets: DatasetMap;
}

const file = datasetsJson as unknown as DatasetsFile;

export const DATASET_META = file.meta;
export const DATASETS = file.datasets;

export type DatasetId = keyof DatasetMap;

export function getDataset<K extends DatasetId>(id: K): DatasetMap[K] {
  return DATASETS[id];
}

export const SYNTHETIC_NOTE =
  "Synthetic data generated locally for teaching — not real customers, patients, employees, or employers.";
