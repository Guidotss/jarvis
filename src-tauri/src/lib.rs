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

#[tauri::command]
async fn transcribe(audio: Vec<u8>) -> Result<String, String> {
    let key = std::env::var("GROQ_API_KEY")
        .map_err(|_| "GROQ_API_KEY no está definida".to_string())?;

    let part = reqwest::multipart::Part::bytes(audio)
        .file_name("audio.webm")
        .mime_str("audio/webm")
        .map_err(|e| e.to_string())?;

    let form = reqwest::multipart::Form::new()
        .part("file", part)
        .text("model", "whisper-large-v3-turbo")
        .text("language", "es")
        .text("response_format", "json");

    let res = reqwest::Client::new()
        .post("https://api.groq.com/openai/v1/audio/transcriptions")
        .bearer_auth(key)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("network: {e}"))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(format!("groq {status}: {body}"));
    }

    let json: serde_json::Value = res
        .json()
        .await
        .map_err(|e| format!("parse: {e}"))?;
    Ok(json["text"].as_str().unwrap_or("").trim().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = dotenvy::dotenv();
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_app, run_routine, transcribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
