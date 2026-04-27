mod commands;
mod config;
mod services;

use commands::routines::run_routine;
use commands::transcribe::transcribe;
use config::env::Env;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Err(e) = Env::load() {
        eprintln!("[jarvis] config inválida: {e}");
        std::process::exit(1);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![run_routine, transcribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
