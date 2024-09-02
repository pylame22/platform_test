import fs from "fs";
import yaml from "yaml";
import dotenv from "dotenv";

interface PostgresConfig {
    db_name: string;
    user: string;
    password: string;
    host: string;
    port: number;
    min_pool_size: number;
    max_pool_size: number;
}

interface DEXConfig {
    main_private_key: string;
    rpc_url: string;
    max_slippage: number;
    max_lamports: number;
    max_retries: number;
}

export interface Config {
    env: string;
    app_host: string;
    app_port: number;
    log_directory: string;
    postgres: PostgresConfig;
    dex: DEXConfig;
}

const loadConfig = (): Config => {
    dotenv.config();
    const file = fs.readFileSync("./config.yml", "utf8");
    const config = yaml.parse(file);
    const configString = JSON.stringify(config);

    const replacedConfigString = configString.replace(/\$\{(\w+)\}/g, (_, variable) => {
        const value = process.env[variable];
        if (!value) {
            throw new Error(`Environment variable ${variable} is not defined`);
        }
        return value;
    });

    return JSON.parse(replacedConfigString);
};

const config = loadConfig();

export default config;
