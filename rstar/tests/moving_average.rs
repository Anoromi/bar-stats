
use bar_stats_wasm::{log_dbg, moving_average::{self, MovingAverageOptions}};
use wasm_bindgen_test::wasm_bindgen_test;


#[wasm_bindgen_test]
fn test_moving_average() {
    let data = vec![1., 2., 3., 4., 5., 6.];

    let result = moving_average::moving_average(data, 2, MovingAverageOptions::SMA).unwrap();
    log_dbg(&result);
}
