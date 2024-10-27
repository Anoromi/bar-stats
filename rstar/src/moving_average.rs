use wasm_bindgen::prelude::wasm_bindgen;
use yata::{
    core::Method,
    methods::{EMA, SMA, SMM, WSMA},
};

#[wasm_bindgen]
pub enum MovingAverageOptions {
    EMA,
    SMA,
    SMM,
    WSMA,
}

#[wasm_bindgen]
pub fn moving_average(
    values: Vec<f64>,
    length: u32,
    method: MovingAverageOptions,
) -> Result<Vec<f64>, String> {
    return match method {
        MovingAverageOptions::EMA => EMA::new_over(length, values).map_err(|v| v.to_string()),
        MovingAverageOptions::SMA => SMA::new_over(length, values).map_err(|v| v.to_string()),
        MovingAverageOptions::SMM => SMM::new_over(length, values).map_err(|v| v.to_string()),
        MovingAverageOptions::WSMA => WSMA::new_over(length, values).map_err(|v| v.to_string()),
    };
}
