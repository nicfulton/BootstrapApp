// config/environment.ts
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import * as path from "path";

interface EnvConfig {
    [key: string]: pulumi.Output<string>;
}

export class EnvironmentWriter {
    private config: EnvConfig;
    private envPaths: string[];

    constructor(config: EnvConfig, envPaths: string[]) {
        this.config = config;
        this.envPaths = envPaths;
    }

    async writeEnvFiles() {
        return pulumi.all(this.config).apply(async (resolvedConfig) => {
            for (const envPath of this.envPaths) {
                const envContent = Object.entries(resolvedConfig)
                    .map(([key, value]) => `REACT_APP_${key}=${value}`)
                    .join('\n');

                try {
                    // Ensure directory exists
                    const dir = path.dirname(envPath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }

                    // Write file
                    fs.writeFileSync(envPath, envContent);
                    console.log(`Environment variables written to ${envPath}`);
                } catch (error) {
                    console.error(`Error writing to ${envPath}:`, error);
                }
            }
            return resolvedConfig;
        });
    }
}
