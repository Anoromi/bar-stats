mod utils;

use core::panic;
use std::{convert::TryInto, fmt::Debug};

use rstar::{
    RTree, RTreeObject, AABB,
};
use rstar::primitives::GeomWithData;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

pub fn log_dbg<T: Debug>(value: &T) {
    log(&format!("{value:?}"))
}

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
        //self.tree
        self.tree.insert(GeomWithData::new([x, y], id));
        //.map_err(|v| v.to_string())?;
        Ok(())
    }

    pub fn range_query(&mut self, x: f64, y: f64, eps: f64) -> Result<Vec<u32>, String> {
        //rstar::primitives::PointWithData

        let values: Vec<_> = self
            .tree
            .locate_within_distance([x, y], eps * eps)
            .map(|v| v.data)
            .collect();
        //let values = self
        //    .tree
        //    .within(&[x, y], eps * eps, &squared_euclidean)
        //    .map_err(|v| v.to_string())?;

        //let values: Vec<_> = values.into_iter().map(|v| *v.1).collect();
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
    pub labels: Vec<i32>,
    pub cluster_count: u32,
}

#[wasm_bindgen]
pub fn depth_clusterize(
    data: Vec<BarPartialPlayerData>,
    eps: f64,
    min_pts: u32,
) -> DepthClusterizationResults {
    let player_data = data.iter().enumerate().map(|(i,v)| {
        GeomWithData::new(
            [v.x, v.y],
            BarPlayerData {
                x: v.x,
                y: v.y,
                index: i.try_into().unwrap(),
                battle_index: v.battle_index,
            },
        )
    }).collect::<Vec<_>>();

    let rtree: RTree<GeomWithData<[f64; 2], BarPlayerData>> = RTree::bulk_load(player_data);


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
        labels,
        cluster_count: label_count.try_into().unwrap(),
    };
}

#[cfg(test)]
mod test {

    use wasm_bindgen_test::wasm_bindgen_test;

    use crate::{depth_clusterize, BarPartialPlayerData};

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

        let result = depth_clusterize(data, 5.0, 2);
        assert_eq!(result.cluster_count, 4);
    }

    #[wasm_bindgen_test]
    fn test_empty_cluster() {
        let data = vec![
        ];

        let result = depth_clusterize(data, 5.0, 2);
    }
}
