use crate::services::apps;

#[tauri::command]
pub fn run_routine(name: String) -> Result<Vec<String>, String> {
    let apps_list: Vec<&str> = match name.as_str() {
        "comenzar-dia" => vec!["Google Chrome", "Cursor", "Slack", "Ghostty"],
        "modo-estudio" => vec!["Preview", "Music"],
        other => return Err(format!("Rutina desconocida: {other}")),
    };

    let mut opened = Vec::new();
    for app in &apps_list {
        if apps::open(app) {
            opened.push((*app).to_string());
        }
    }
    Ok(opened)
}
