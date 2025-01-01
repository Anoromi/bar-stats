use std::{
    cmp::Ordering,
    ops::{Deref, DerefMut},
};

#[derive(PartialOrd, Clone, Copy, Debug)]
pub struct Tf32(pub f32);

impl Deref for Tf32 {
    type Target = f32;

    fn deref(&self) -> &Self::Target {
        return &self.0;
    }
}

impl DerefMut for Tf32 {
    fn deref_mut(&mut self) -> &mut Self::Target {
        return &mut self.0;
    }
}

impl PartialEq for Tf32 {
    fn eq(&self, other: &Self) -> bool {
        self.total_cmp(other) == Ordering::Equal
    }
}

impl Eq for Tf32 {}

impl Ord for Tf32 {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.total_cmp(other)
    }
}

impl From<f32> for Tf32 {
    fn from(value: f32) -> Self {
        return Tf32(value);
    }
}

impl From<Tf32> for f32 {
    fn from(value: Tf32) -> Self {
        return value.0;
    }
}
