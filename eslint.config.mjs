import nextVitals from "eslint-config-next/core-web-vitals"
import prettier from "eslint-config-prettier"

const config = [
  ...nextVitals,
  prettier,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "coverage/**"],
  },
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default config
