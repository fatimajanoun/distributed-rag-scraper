import { extractPageContent } from "./src/text/extractPageContent.js";

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Restaurant Menu</title>
  </head>

  <body>
    <script>console.log("This should not appear");</script>

    <h1>Welcome to Savora</h1>
    <p>Discover our available meals.</p>

    <table>
      <tr>
        <th>Meal</th>
        <th>Price</th>
      </tr>
      <tr>
        <td>Burger</td>
        <td>$10</td>
      </tr>
      <tr>
        <td>Pizza</td>
        <td>$15</td>
      </tr>
    </table>

    <a href="/menu.pdf">Download menu</a>
    <a href="/documents/report.docx">Download report</a>
    <a href="/about">About us</a>
  </body>
</html>
`;

const result = extractPageContent(
  html,
  "https://example.com/restaurants/1",
);

console.dir(result, {
  depth: null,
});