# GitHub Commit Graphghan

This is a project originally made from a GitHub Spark which I made into a full app! Thank you GitHub Spark for helping me prototype this :heart:

## Development instructions

1. Add a `.env` file with `VITE_GITHUB_CLIENT_ID` and `VITE_GITHUB_CLIENT_SECRET` mapping to a localhost:8888 GitHub Oauth project
2. Run `netlify dev`

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. To run the tests:

```bash
npm test          # Run tests once
npm run test:watch # Run tests in watch mode
```

All tests must pass before pull requests can be merged. The GitHub Actions workflow automatically runs tests on every push and pull request to the main branch.

## Contributing

Anyone can feel free to submit a pull request or an issue suggestion to make this better :heart: 

Please use the #CommitGraphghan hashtag on social media so we can see what you create! :sparkles: