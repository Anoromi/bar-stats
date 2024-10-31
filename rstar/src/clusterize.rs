use std::{convert::{TryFrom, TryInto}, ops::Deref};

use rstar::{primitives::GeomWithData, RTree, RTreeObject, AABB};
use wasm_bindgen::prelude::wasm_bindgen;

struct IndexedPoint {
    x: f64,
    y: f64,
    index: u32,
}

impl RTreeObject for IndexedPoint {
    type Envelope = AABB<[f64; 2]>;

    fn envelope(&self) -> Self::Envelope {
        AABB::from_point([self.x, self.y])
    }
}

#[wasm_bindgen]
struct SpatialIndex {
    tree: RTree<GeomWithData<[f64; 2], u32>>,
}

#[wasm_bindgen]
impl SpatialIndex {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        return Self { tree: RTree::new() };
    }

    pub fn add(&mut self, id: u32, x: f64, y: f64) -> Result<(), String> {
        self.tree.insert(GeomWithData::new([x, y], id));
        Ok(())
    }

    pub fn range_query(&mut self, x: f64, y: f64, eps: f64) -> Result<Vec<u32>, String> {
        let values: Vec<_> = self
            .tree
            .locate_within_distance([x, y], eps * eps)
            .map(|v| v.data)
            .collect();
        return Ok(values);
    }
}

#[derive(Clone, Copy)]
struct BarPlayerData {
    pub index: usize,
    pub battle_index: u32,
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct BarPartialPlayerData {
    pub battle_index: u32,
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
impl BarPartialPlayerData {
    #[wasm_bindgen(constructor)]
    pub fn new(battle_index: u32, x: f64, y: f64) -> Self {
        return Self { battle_index, x, y };
    }
}

const NOISE_LABEL: i32 = 0;

#[wasm_bindgen]
#[derive(Debug)]
pub struct DepthClusterizationResults {
    #[wasm_bindgen(getter_with_clone)]
    pub labels: Vec<u32>,
    pub cluster_count: u32,
}

fn db_clusterize(
    rtree: &RTree<GeomWithData<[f64; 2], BarPlayerData>>,
    data: Vec<BarPartialPlayerData>,
    eps: f64,
    min_pts: u32,
) -> DepthClusterizationResults {
    fn range_query(
        rtree: &RTree<GeomWithData<[f64; 2], BarPlayerData>>,
        x: f64,
        y: f64,
        index: usize,
        eps: f64,
    ) -> Vec<usize> {
        return rtree
            .locate_within_distance([x, y], eps * eps)
            .map(|v| v.data.index)
            .filter(|v| *v != index)
            .collect::<Vec<_>>();
    }

    let mut labels = vec![-1; data.len()];
    let mut label_count: i32 = 1;
    for (i, p) in data.iter().enumerate() {
        if labels[i] != -1 {
            continue;
        }

        let neighbors = range_query(&rtree, p.x, p.y, i.try_into().unwrap(), eps);

        if neighbors.len() + 1 < min_pts.try_into().unwrap() {
            labels[i] = NOISE_LABEL;
        }
        let label = label_count;
        labels[i] = label;
        label_count += 1;

        let mut seeds = neighbors;
        let mut j = 0;
        while j < seeds.len() {
            let q_index = seeds[j];
            let q = data[q_index];
            if labels[q_index] == NOISE_LABEL {
                labels[q_index] = label;
            } else if labels[q_index] > 0 {
                j += 1;
                continue;
            }
            labels[q_index] = label;

            let q_neighbours = range_query(&rtree, q.x, q.y, q_index, eps);
            if q_neighbours.len() + 1 >= min_pts.try_into().unwrap() {
                for qn in q_neighbours.into_iter().filter(|v| labels[*v] > 0) {
                    seeds.push(qn);
                }
            }
            j += 1;
        }
    }
    return DepthClusterizationResults {
        labels: labels.into_iter().map(|v| v.try_into().unwrap()).collect(),
        cluster_count: label_count.try_into().unwrap(),
    };
}

#[wasm_bindgen]
pub fn clusterize_with_limit(
    data: Vec<BarPartialPlayerData>,
    eps: f64,
    min_pts: u32,
    _max_pts: u32,
    cluster_size_factor_threshold: u32,
) -> DepthClusterizationResults {
    let player_data = data
        .iter()
        .enumerate()
        .map(|(i, v)| {
            GeomWithData::new(
                [v.x, v.y],
                BarPlayerData {
                    x: v.x,
                    y: v.y,
                    index: i.try_into().unwrap(),
                    battle_index: v.battle_index,
                },
            )
        })
        .collect::<Vec<_>>();

    let rtree: RTree<GeomWithData<[f64; 2], BarPlayerData>> = RTree::bulk_load(player_data);

    let DepthClusterizationResults {
        mut labels,
        cluster_count,
    } = db_clusterize(&rtree, data, eps, min_pts);
    let mut label_point_counts = vec![0u32; cluster_count.try_into().unwrap()];

    for v in labels.iter() {
        let normalized_label: usize = (*v).try_into().unwrap();
        label_point_counts[normalized_label] += 1;
    }

    let max_points = *label_point_counts.iter().max().unwrap();

    let min_cluster_size = max_points / cluster_size_factor_threshold;

    let remove_label = label_point_counts.iter().map(|v| v < &min_cluster_size).collect::<Vec<_>>();

    for label in labels.iter_mut() {
        if remove_label[usize::try_from(*label).unwrap()] {
            *label = 0;
        }
    }

    //let 
    // TODO Add overflowing splitting
    // let overflowing_labels = point_count
    //     .into_iter()
    //     .enumerate()
    //     .filter(|v| v.1 > max_pts);
    return DepthClusterizationResults {
        labels,
        cluster_count,
    };
}

#[cfg(test)]
mod test {

    use wasm_bindgen_test::wasm_bindgen_test;

    use crate::clusterize::{clusterize_with_limit, db_clusterize, BarPartialPlayerData};

    #[wasm_bindgen_test]
    fn test_clusterize() {
        let data = vec![
            BarPartialPlayerData::new(0, 0.0, 0.0),
            BarPartialPlayerData::new(0, 1.0, 1.0),
            BarPartialPlayerData::new(0, 0.0, 2.0),
            BarPartialPlayerData::new(0, 5.0, 5.0),
            BarPartialPlayerData::new(0, 10.0, 10.0),
            BarPartialPlayerData::new(0, 11.0, 11.0),
            BarPartialPlayerData::new(0, 11.0, 12.0),
        ];

        let result = clusterize_with_limit(data, 5.0, 2, 1000);
        assert_eq!(result.cluster_count, 4);
    }

    #[wasm_bindgen_test]
    fn test_empty_cluster() {
        let data = vec![];

        let result = db_clusterize(data, 5.0, 2, 1000);
    }
}
