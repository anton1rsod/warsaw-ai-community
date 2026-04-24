import next from "eslint-config-next";

const config = [...next, { ignores: [".next/", "coverage/"] }];

export default config;
