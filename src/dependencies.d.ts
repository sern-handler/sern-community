/**
 * This file serves as intellisense for sern projects.
 * Types are declared here for dependencies to function properly
 * Service(s) api rely on this file to provide a better developer experience.
 */

import type {
    SernEmitter,
    CoreDependencies,
} from "@sern/handler";
import type { Client } from "discord.js";
import type { SernLogger } from "./utils/Logger";
import type { Octokit } from "@octokit/rest";
declare global {
    interface Dependencies extends Dependencies {
        "@sern/client": Client;
        "@sern/logger": SernLogger;
        octokit: Octokit;
        process: NodeJS.Process
    }
}

export {};
