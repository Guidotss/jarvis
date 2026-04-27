use crate::services::groq;

#[tauri::command]
pub async fn transcribe(audio: Vec<u8>) -> Result<String, String> {
    groq::transcribe(audio).await
}
