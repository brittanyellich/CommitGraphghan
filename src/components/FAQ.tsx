import React from 'react';

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>
      <ul className="space-y-4">
        <li>
          <strong>How do I use this app?</strong>
          <p>Connect your GitHub account, select years, and generate your contribution pattern.</p>
        </li>
        <li>
          <strong>What's a graphghan?</strong>
          <p>A graphghan is another way of describing a Corner-to-Corner (C2C) crochet pattern. You can <a href="https://www.craftematics.com/crochet/corner-to-corner" target="_blank" rel="noopener noreferrer">learn more about the basics of a C2C pattern here!</a></p>
        </li>
        <li>
          <strong>Is my GitHub data stored?</strong>
          <p>This website doesn't store any data except for some details to be able to get your GitHub contributions. It's stored in your session storage, so it will be cleared when you close your browser.</p>
        </li>
        <li>
          <strong>Where can I report bugs or request features?</strong>
          <p>Visit our <a href="https://github.com/brittanyellich/commitgraphghan" target="_blank" rel="noopener noreferrer" className="text-primary underline">GitHub repository</a>.</p>
        </li>
      </ul>
    </div>
  );
}
