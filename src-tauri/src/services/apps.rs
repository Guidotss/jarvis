use std::process::Command;

pub fn open(app: &str) -> bool {
    Command::new("open")
        .arg("-a")
        .arg(app)
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}
