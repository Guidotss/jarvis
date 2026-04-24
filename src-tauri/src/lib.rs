use serde::Serialize;
use std::process::Command;

#[derive(Serialize)]
struct CommandResult {
    success: bool,
    message: String,
}

#[tauri::command]
fn open_app(name: String) -> Result<CommandResult, String> {
    let output = Command::new("open")
        .arg("-a")
        .arg(&name)
        .output()
        .map_err(|e| format!("No pude ejecutar 'open': {e}"))?;

    if output.status.success() {
        Ok(CommandResult {
            success: true,
            message: format!("Abriendo {name}"),
        })
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}

#[tauri::command]
fn run_routine(name: String) -> Result<Vec<String>, String> {
    let apps: Vec<&str> = match name.as_str() {
        "comenzar-dia" => vec!["Google Chrome", "Cursor", "Slack"],
        "modo-estudio" => vec!["Preview", "Music"],
        other => return Err(format!("Rutina desconocida: {other}")),
    };

    let mut opened = Vec::new();
    for app in &apps {
        let ok = Command::new("open")
            .arg("-a")
            .arg(app)
            .status()
            .map(|s| s.success())
            .unwrap_or(false);
        if ok {
            opened.push((*app).to_string());
        }
    }
    Ok(opened)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_app, run_routine])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
