export const REPO_URL = "https://github.com/DrOsmium/Omilia";

// tslint:disable-next-line:interface-name
export interface DevDependency {
    name: string;
    website: string;
    license: string;
}

export const DEPENDENCIES: DevDependency[] = [
    {name: "nodejs", website: "https://nodejs.org/en", license: "MIT"},
    {name: "discordjs", website: "https://discord.js.org", license: "Apache-2.0"},
    {name: "dotenv", website: "https://www.npmjs.com/package/dotenv", license: "BSD-2-Clause"},
    {name: "rxjs", website: "https://www.npmjs.com/package/rxjs", license: "Apache-2.0"},
];
