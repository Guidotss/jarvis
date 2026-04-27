use crate::config::env::Env;

const GROQ_URL: &str = "https://api.groq.com/openai/v1/audio/transcriptions";
const MODEL: &str = "whisper-large-v3-turbo";
const LANG: &str = "es";

pub async fn transcribe(audio: Vec<u8>) -> Result<String, String> {
    let key = &Env::get().groq_api_key;

    let part = reqwest::multipart::Part::bytes(audio)
        .file_name("audio.webm")
        .mime_str("audio/webm")
        .map_err(|e| e.to_string())?;

    let form = reqwest::multipart::Form::new()
        .part("file", part)
        .text("model", MODEL)
        .text("language", LANG)
        .text("response_format", "json");

    let res = reqwest::Client::new()
        .post(GROQ_URL)
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
