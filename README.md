# Operand React

A component library for [Operand](https://operand.ai) products, like [WOPR](https://wopr.operand.ai).

# Component Styling

Currently there is no custom styling for the component and we used TailwindCSS to style the component.

## Non-Tailwind Projects:

We have provided a minified operand.css file that can be imported to style the component for non-tailwind projects.

```jsx
import '@operandinc/react/dist/operand.css';
```

## Tailwind Projects:

Projects with tailwind must simply include the module in the contents section of ‘tailwind.config.js’.

```jsx
module.exports = {
  content: [
		....
    "./node_modules/@operandinc/react/dist/*.js",
  ],
	....
}
```

# Questions?

Send us a message at [support@operand.ai](mailto:support@operand.ai).
