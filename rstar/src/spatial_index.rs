use std::{
    cmp::Ordering,
    collections::{BTreeMap, HashMap},
    hash::Hash,
    iter::{self},
    ops::{Deref, DerefMut},
};

use rstar::{primitives::GeomWithData, RTree};

use crate::{clusterize::BarPlayerData, total_f32::Tf32};

pub trait SpatialIndex {
    type Data;

    fn find_adjacent_vec(&self, point: Point2d) -> Vec<(Point2d, Self::Data)> {
        return self.find_adjacent_iter(point).collect();
    }

    fn find_adjacent_iter(&self, point: Point2d) -> impl Iterator<Item = (Point2d, Self::Data)>;
}

pub struct EpsRTree(pub RTree<GeomWithData<Point2d, BarPlayerData>>, pub f32);

impl SpatialIndex for EpsRTree {
    type Data = BarPlayerData;

    fn find_adjacent_iter(&self, point: [f32; 2]) -> impl Iterator<Item = (Point2d, Self::Data)> {
        return self
            .0
            .locate_within_distance(point, self.1 * self.1)
            .map(|v| (*v.geom(), v.data));
    }
}

#[derive(Debug)]
pub struct BoxMap {
    map: BTreeMap<BoundBox, Vec<([f32; 2], BarPlayerData)>>,
    box_size: f32,
    eps: f32,
}

#[derive(Debug, PartialEq, PartialOrd, Eq, Ord)]
struct BoundBox {
    values: [Tf32; 2],
}

impl BoundBox {
    fn new(values: [f32; 2]) -> Self {
        Self {
            values: [Tf32(values[0]), Tf32(values[1])],
        }
    }

    fn values(&self) -> [f32; 2] {
        [*self.values[0], *self.values[1]]
    }
}

type Point2d = [f32; 2];

impl BoxMap {
    fn translate_point(point: Point2d, size: f32) -> BoundBox {
        let stabilized_position = [f32::floor(point[0] / size), f32::floor(point[1] / size)];

        let bound_box = BoundBox {
            values: [stabilized_position[0].into(), stabilized_position[1].into()],
        };

        return bound_box;
    }

    pub fn from_geom_with_data(
        data: Vec<GeomWithData<Point2d, BarPlayerData>>,
        eps: f32,
    ) -> BoxMap {
        let box_size = eps / f32::sqrt(2.);

        let mut map = BTreeMap::<BoundBox, Vec<(Point2d, BarPlayerData)>>::new();

        for v in data.into_iter() {
            let position = *v.geom();
            let bound_box = BoxMap::translate_point(position, box_size);

            match map.get_mut(&bound_box) {
                Some(b) => {
                    b.push((position, v.data));
                }
                None => {
                    map.insert(bound_box, vec![(position, v.data)]);
                }
            }
        }

        return BoxMap { map, eps, box_size };
    }
}

impl SpatialIndex for BoxMap {
    type Data = BarPlayerData;

    fn find_adjacent_iter(&self, point: [f32; 2]) -> impl Iterator<Item = (Point2d, Self::Data)> {
        let original_box = Self::translate_point(point, self.box_size);
        let boxes = [
            [original_box.values()[0] + 1., original_box.values()[1]],
            [original_box.values()[0] - 1., original_box.values()[1]],
            [original_box.values()[0], original_box.values()[1] + 1.],
            [original_box.values()[0], original_box.values()[1] - 1.],
            [original_box.values()[0] + 1., original_box.values()[1] - 1.],
            [original_box.values()[0] - 1., original_box.values()[1] + 1.],
            [original_box.values()[0] + 1., original_box.values()[1] + 1.],
            [original_box.values()[0] - 1., original_box.values()[1] - 1.],
        ];
        let k = self
            .map
            .get(&original_box)
            .into_iter()
            .flat_map(|v| v.iter().copied());
        let sq_eps = self.eps * self.eps;

        let outher_shell = IntoIterator::into_iter(boxes).flat_map(move |box_value| {
            let potential = self.map.get(&BoundBox::new(box_value));
            potential.into_iter().flat_map(move |v| {
                v.iter()
                    .filter(move |p| squared_euclidian(p.0, point) < sq_eps)
                    .copied()
            })
        });
        return k.chain(outher_shell);
    }
}

fn squared_euclidian(a: Point2d, b: Point2d) -> f32 {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    return x * x + y * y;
}

#[cfg(all(test))]
mod tests {

    use core::panic;

    use rstar::primitives::GeomWithData;

    use crate::clusterize::BarPlayerData;

    use super::{BoundBox, BoxMap, Point2d, SpatialIndex};

    #[test]
    fn test_bounding_box_basic() {
        let data: Vec<GeomWithData<Point2d, BarPlayerData>> = vec![
            GeomWithData::new([0., 0.], BarPlayerData { index: 0 }),
            GeomWithData::new([10., 10.], BarPlayerData { index: 1 }),
            GeomWithData::new([0., 10.], BarPlayerData { index: 2 }),
            GeomWithData::new([220., 230.534], BarPlayerData { index: 3 }),
            GeomWithData::new([223., 240.534], BarPlayerData { index: 4 }),
            GeomWithData::new([10000., 0.], BarPlayerData { index: 4 }),
            GeomWithData::new([10001., 0.], BarPlayerData { index: 4 }),
            GeomWithData::new([10002., 0.], BarPlayerData { index: 4 }),
            // GeomWithData::new([0., 0.], BarPlayerData { index: 0 }),
            // GeomWithData::new([0., 0.], BarPlayerData { index: 0 }),
        ];
        let eps = 200.;
        let bounding_box = BoxMap::from_geom_with_data(data, eps);

        let values = bounding_box.map.get(&BoundBox::new([0., 0.])).unwrap();
        assert_eq!(values.len(), 3);

        let normalize = |value: f32| (value / (eps / 2f32.sqrt())).floor();
        let n1 = [normalize(220.), normalize(230.534)];
        let n2 = [normalize(223.), normalize(240.534)];

        assert_eq!(n1, n2);
        dbg!(&bounding_box);

        assert_eq!(bounding_box.map.len(), 3);

        let values = bounding_box
            .map
            .get(&BoundBox::new([normalize(220.), normalize(230.534)]))
            .unwrap();
        assert_eq!(values.len(), 2);

        let values = bounding_box
            .map
            .get(&BoundBox::new([normalize(10000.), normalize(0.)]))
            .unwrap();
        assert_eq!(values.len(), 3);
    }

    #[test]
    fn test_bounding_box_nearby() {
        let data: Vec<GeomWithData<Point2d, BarPlayerData>> = vec![
            GeomWithData::new([0., 0.], BarPlayerData { index: 0 }),
            GeomWithData::new([10., 10.], BarPlayerData { index: 1 }),
            GeomWithData::new([0., 10.], BarPlayerData { index: 2 }),
            GeomWithData::new([220., 230.534], BarPlayerData { index: 3 }),
            GeomWithData::new([223., 240.534], BarPlayerData { index: 4 }),
            // GeomWithData::new([0., 0.], BarPlayerData { index: 0 }),
            // GeomWithData::new([0., 0.], BarPlayerData { index: 0 }),
        ];
        let eps = 200.;
        let bounding_box = BoxMap::from_geom_with_data(data, eps);

        let values = bounding_box
            .find_adjacent_iter([150., 150.])
            .collect::<Vec<_>>();

        assert_eq!(values.len(), 3);
        assert!(values.contains(&([10., 10.], BarPlayerData { index: 1 })));
        assert!(values.contains(&([220., 230.534], BarPlayerData { index: 3 })));
        assert!(values.contains(&([223., 240.534], BarPlayerData { index: 4 })));
    }

    #[test]
    fn test_bounding_box_else() {
        let mut data: Vec<GeomWithData<Point2d, BarPlayerData>> = vec![];

        data.extend(
            clump([0., 1000.], 10, [10., 10.])
                .map(|v| GeomWithData::new(v, BarPlayerData { index: 0 })),
        );

        data.extend(
            clump([1000., 0.], 10, [10., 10.])
                .map(|v| GeomWithData::new(v, BarPlayerData { index: 0 })),
        );

        data.extend(
            clump([1000., 100.], 10, [10., 10.])
                .map(|v| GeomWithData::new(v, BarPlayerData { index: 0 })),
        );

        data.extend(
            clump([1000., 1000.], 10, [10., 10.])
                .map(|v| GeomWithData::new(v, BarPlayerData { index: 0 })),
        );

        data.extend(
            clump([1300., 0.], 10, [10., 10.])
                .map(|v| GeomWithData::new(v, BarPlayerData { index: 0 })),
        );

        let eps = 200.;
        // assert_eq!(data.len(), 10 * 10 * 2);

        let bounding_box = BoxMap::from_geom_with_data(data, eps);

        let values = bounding_box
            .find_adjacent_iter([1000., 1000.])
            .collect::<Vec<_>>();

        dbg!(&bounding_box);

        panic!()
        // assert_eq!(values.len(), 10 * 10 * 2);
    }

    fn clump(
        position: Point2d,
        size: usize,
        displacement: Point2d,
    ) -> impl Iterator<Item = [f32; 2]> {
        (0..size).flat_map(move |i| {
            (0..size).map(move |j| {
                [
                    position[0] + (i as f32) * displacement[0],
                    position[1] + (j as f32) * displacement[1],
                ]
            })
        })
    }
}
