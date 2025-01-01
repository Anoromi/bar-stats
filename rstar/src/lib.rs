pub mod clusterize;
mod utils;
pub mod moving_average;
pub mod spatial_index;
mod total_f32;

use core::panic;
use std::fmt::Debug;

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
