use std::sync::OnceLock;

pub struct Env {
    pub groq_api_key: String,
}

static ENV: OnceLock<Env> = OnceLock::new();

impl Env {
    pub fn load() -> Result<(), String> {
        let _ = dotenvy::dotenv();

        let env = Env {
            groq_api_key: require("GROQ_API_KEY")?,
        };

        ENV.set(env)
            .map_err(|_| "Env ya estaba inicializado".to_string())
    }

    pub fn get() -> &'static Env {
        ENV.get()
            .expect("Env no inicializado — llamá a Env::load() en startup")
    }
}

fn require(key: &str) -> Result<String, String> {
    std::env::var(key).map_err(|_| format!("{key} no está definida en .env"))
}
