# jeanluclindsay.com

[![Greenkeeper badge](https://badges.greenkeeper.io/dhritzkiv/jeanluclindsay.com.svg)](https://greenkeeper.io/)

The server and client for [jeanluclindsay.com](jeanluclindsay.com).

## Requirements

- node v6.0.0+

## Initial Setup

`npm install`

## Server Usage

`node server`

Will run the entry `index.js` file inside `/server`;

### Environment Variables and Options

- `NODE_ENV` Either `development` or `production`. Defaults to `development`
- `SENTRY_DSN_SERVER` The DSN for the project on Sentry

Other settings can be tweaked in `config.js`

## Building the Client

- `gulp watch`
	- Will start watching for changes to files in `/client/development` and run the appropriate tasks.
	- Alternatively, run `gulp build` to compile the project once.

### Releasing

- `gulp release`
	- Will minify the css and js files.

## Content

The content directory should contain the markdown files for `about` and `contact` pages, as well as a directory for the series. Each subdirectory in series is an individual series. The name of a series directory is the name of the series. The series directory should contain a `pieces.csv` file with the following columns: `title`, `date`, `materials`, `size`, `images`. `images` is a commas separated list of image file names, pointing to images in the directory.