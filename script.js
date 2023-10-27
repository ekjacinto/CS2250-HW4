// https://jsonplaceholder.typicode.com/guide/

async function downloadPosts(page = 1) {
  const postsURL = `https://jsonplaceholder.typicode.com/posts?_page=${page}`;
  const response = await fetch(postsURL);
  const articles = await response.json();
  return articles;
}

async function downloadComments(postId) {
  const commentsURL = `https://jsonplaceholder.typicode.com/posts/${postId}/comments`;
  const response = await fetch(commentsURL);
  const comments = await response.json();
  return comments;
}

async function getUserName(userId) {
  const userURL = `https://jsonplaceholder.typicode.com/users/${userId}`;
  const response = await fetch(userURL);
  const user = await response.json();
  return user.name;
}

function getArticleId(comments) {
  const article = comments.previousElementSibling;
  const data = article.dataset;
  return data.postId;
}

const details = document.getElementsByTagName("details");
for (const detail of details) {
  detail.addEventListener("toggle", async (event) => {
    if (detail.open) {
      const asides = detail.getElementsByTagName("aside");
      const commentsWereDownloaded = asides.length > 0;
      if (!commentsWereDownloaded) {
        const articleId = getArticleId(detail);
        const comments = await downloadComments(articleId);
        console.log(comments);
      }
    }
  });
}

const main = document.querySelector("main");

// individual article function to create ONE article
async function createArticle(post) {
  // creating elements from article format
  const article = document.createElement("article");
  article.dataset.postId = post.id;

  const h2 = document.createElement("h2");
  h2.textContent = post.title;

  const aside = document.createElement("aside");
  const span = document.createElement("span")
  aside.appendChild(span);

  // call getUserName() and pass in userId
  const userName = await getUserName(post.userId);
  span.textContent = `by ${userName}`;

  const paragraph = document.createElement("p");
  paragraph.innerHTML = post.body.replace(/\n/g, "<br>");

  article.appendChild(h2);
  article.appendChild(aside);
  article.appendChild(paragraph);

  return article;
}

/** 
 * dynamically uses createArticle() to 
 * populate page with articles and comments
 * */ 
async function populatePage() {
  const posts = await downloadPosts();
  console.log(posts);

  posts.forEach(async (post) => {
    const article = await createArticle(post);
    main.appendChild(article);

    // details part
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "See what our reads had to say...";
    details.appendChild(summary);

    const section = document.createElement("section");
    const header = document.createElement("header");
    const h3 = document.createElement("h3");
    h3.textContent = "Comments";
    section.appendChild(header);
    header.appendChild(h3);

    details.appendChild(section);
    main.appendChild(details);

    details.addEventListener("toggle", async (event) => {
      if (details.open) {
        const asides = details.getElementsByTagName("aside");
        const commentsWereDownloaded = asides.length > 0;
        if (!commentsWereDownloaded) {
          const articleId = getArticleId(details);
          const comments = await downloadComments(articleId);
          console.log(comments);

          // create and load in comments
          comments.forEach((comment) => {
            const aside = document.createElement("aside");
            const firstParagraph = document.createElement("p");
            firstParagraph.innerHTML = comment.body.replace(/\n/g, "<br>");

            const secondParapgraph = document.createElement("p");
            const small = document.createElement("small");
            small.textContent = comment.name;
            secondParapgraph.appendChild(small);

            aside.appendChild(firstParagraph);
            aside.appendChild(secondParapgraph);
            section.appendChild(aside);
          });
        }
      }
    });
  });
}

populatePage();