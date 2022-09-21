import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	dts: false,
	entry: ["src/**/*.ts", "!src/**/*.d.ts", "typings/"],
	format: ["esm"],
	minify: false,
	silent: true,
	skipNodeModulesBundle: true,
	sourcemap: false,
	target: "esnext",
	bundle: false,
	shims: false,
	keepNames: true,
	splitting: false,
	define: {
		this: "global",
	},
});
