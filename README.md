# Sandy Mae Birao portfolio

This is a static HTML/CSS/JavaScript portfolio prepared for GitHub Pages.

## Publish with GitHub Pages

1. Create or choose a GitHub repository for this site and push these source files to its `main` branch.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. The workflow at `.github/workflows/deploy.yml` will build a public-only artifact and deploy it. The artifact contains the site pages, CSS, JavaScript, and portfolio media. It excludes Git metadata, workflow files, tools, and other workspace files.
4. Wait for the `Deploy static portfolio to GitHub Pages` workflow to finish. GitHub shows the public URL in **Settings → Pages** and in the workflow deployment.
5. In **Settings → Pages**, enable **Enforce HTTPS** when available.

The workflow sets the site’s base URL from GitHub Pages, including the repository path, then fills in canonical URLs, social preview URLs, `robots.txt`, and the sitemap.

## Privacy and security

This site uses no server, database, form processor, account system, API keys, or runtime dependencies. The deployment workflow has limited token permissions and publishes only an explicit allowlist. A content security policy restricts scripts, media, styles, and connections to this site. HTTPS should be enforced in the Pages settings.

Anything included in a public GitHub Pages site can be viewed, copied, and downloaded. The portfolio photos and videos are intentionally public. Do not place private documents, credentials, or other confidential files in this repository.

## Build locally

With Python 3 installed, run:

```powershell
python tools/build_site.py dist https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY
```

The destination is replaced when the build runs. Choose a dedicated output directory such as `dist`.
