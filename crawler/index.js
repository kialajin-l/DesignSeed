'use strict';

const DesignFetcher = require('./fetcher');
const DesignParser = require('./parser');
const CssExtractor = require('./css-extractor');
const ComponentDetector = require('./component-detector');
const sources = require('./sources.json');

module.exports = { DesignFetcher, DesignParser, CssExtractor, ComponentDetector, sources };
