use std::{convert::TryInto, iter};

use wasm_bindgen::prelude::wasm_bindgen;
use yata::{
    core::Method,
    methods::{EMA, SMA, SMM, SWMA, WSMA},
};

#[wasm_bindgen]
pub enum MovingAverageOptions {
    EMA,
    SMA,
    SMM,
    WSMA,
    SSMA,
}

#[wasm_bindgen]
pub fn moving_average(
    mut values: Vec<f64>,
    length: u32,
    method: MovingAverageOptions,
) -> Result<Vec<f64>, String> {
    let start = values
        .iter()
        .take(length.try_into().unwrap())
        .copied()
        .reduce(|a, b| a + b)
        .unwrap()
        / f64::from(length);

    values.insert(0, start);
    let mut result = match method {
        MovingAverageOptions::EMA => EMA::new_over(length, values).map_err(|v| v.to_string()),
        MovingAverageOptions::SMA => SMA::new_over(length, values).map_err(|v| v.to_string()),
        MovingAverageOptions::SMM => SMM::new_over(length, values).map_err(|v| v.to_string()),
        MovingAverageOptions::WSMA => WSMA::new_over(length, values).map_err(|v| v.to_string()),
        MovingAverageOptions::SSMA => SWMA::new_over(length, values).map_err(|v| v.to_string()),
    }?;

    result.remove(0);
    return Ok(result);
}
