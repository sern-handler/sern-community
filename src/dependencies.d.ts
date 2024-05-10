/**
 * This file serves as intellisense for sern projects.
 * Types are declared here for dependencies to function properly
 * Service(s) api rely on this file to provide a better developer experience.
 */

import type {
    SernEmitter,
    Logging,
    CoreModuleStore,
    ModuleManager,
    ErrorHandling,
    CoreDependencies,
    Singleton,
} from "@sern/handler";
import type { Client } from "discord.js";
import type { SernLogger } from "./utils/Logger";
import type { Octokit } from "@octokit/rest";
declare global {
    interface Dependencies extends Dependencies {
        "@sern/client": Singleton<Client>;
        "@sern/logger": Singleton<SernLogger>;
        octokit: Singleton<Octokit>;
    }
}

export {};
