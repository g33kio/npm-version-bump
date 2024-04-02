# npm-version-bump

Like everyone else, I use branch protection to keep the main branch clean and protect my work. I only recently started
adding npm packages to ci/cd using Github actions. I ran into a problem with almost all of the existing actions related
to bumping the version of my npm packages. I have yet to find one that I can use that doesn’t require some kind of hack
to bypass the main branch protection, which is where I want to publish the actual release version of my package. So, I
wrote my first action to take a different approach. This action uses the npm view {package-name} version to get the
current package version and then bumps it based on keywords in the commit messages.

## Usage

```yaml
name: Publish NPM Package
on:
  push:
    branches:
      - main
jobs:
  publish:
    name: Publish Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: 'actions/checkout@v4'
      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
```

The above default config will do the following.

* Checks out the source code
* Sets up node with the version I want and my npm token
* It will get the package name from the working directory using ```npm view . –json```
    * Goes through the list of commits and does the following
    * Looks for major or +++ in a commit message and increases the major by 1 for each occurrence
    * Looks for minor or ++ in a commit message and increases the minor by 1 for each occurrence
    * Looks for patch or + in a commit message and increased the patch by 1 for each occurrence
    * If no versions were changed, the patch will be increased by 1 as the default
* Once a new version is set npm ci and npm publish are called

## Configuration

You can customize the configuration with the following options.

### tag-version

#### Default: false

When set to true, this will call ```git tag newVersion``` and push the tag up.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          tag-version: 'true'
```

### tag-prefix

#### Default: 'v'

This will append the value to the front of the git tag. This is ignored if ```tag-version``` is false.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          tag-prefix: 'v'
```

### tag-version

#### Default: false

When set to true, this will call ```git tag newVersion``` and push the tag up.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          tag-version: 'true'
```

### major-keywords

#### Default: 'major,+++'

A comma separated list of keywords that can be used in commit messages to bump the major version number.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          major-keywords: 'major,+++'
```

### minor-keywords

#### Default: 'minor,++'

A comma separated list of keywords that can be used in commit messages to bump the minor version number.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          minor-keywords: 'minor,+++'
```

### patch-keywords

#### Default: 'patch,+'

A comma separated list of keywords that can be used in commit messages to bump the patch version number.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          patch-keywords: 'patch,+++'
```

### bump-first-only

#### Default: 'false'

When set to true, the first bump keyword found will be updated that version number and no other messages/version numbers
will be processed.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          bump-first-only: 'false'
```

### reset-lower

#### Default: 'false'

This will be ignored unless bump-first-only is set to true. When this is true, the lower version numbers will be reset
when a bump on Major or Minor happens. When Major is bumped then Minor and Patch will be set to 0. When a Minor is
bumped then Patch will be set to 0.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          reset-lower: 'false'
```

### pre-release

#### Default: ''

When this has a value, it will be added to the end of the npm package version. This is useful for creating pre-release,
or alpha versions.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          pre-release: 'alpha'
```

### working-dir

#### Default: ''

Use this if your ```package.json``` file is in a sub directory in instances where multiple npm packages are in one
repository.

```yaml
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          working-dir: '/my-sub-package'
```

## Quick Template

Below is a template with every option set, feel free to copy and modify as needed.

### Dev Branch

```yaml
name: Development NPM Package
on:
  push:
    branches:
      - feature/*
      - bugfix/*
      - hotfix/*
jobs:
  publish:
    name: Pre-Release Publish
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: 'actions/checkout@v4'
      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          tag-version: 'true'
          tag-prefix: 'pre-release'
          major-keywords: 'major,+++'
          minor-keywords: 'minor,++'
          patch-keywords: 'patch,+'
          pre-release: 'pre-release'
```

## Test/Stage/QA Branch

```yaml
name: Stage NPM Package
on:
  push:
    branches:
      - dev
jobs:
  publish:
    name: Beta Publish
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: 'actions/checkout@v4'
      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          tag-version: 'true'
          tag-prefix: 'beta'
          major-keywords: 'major,+++'
          minor-keywords: 'minor,++'
          patch-keywords: 'patch,+'
          pre-release: 'beta'
```

### Production Branch

```yaml
name: Release NPM Package
on:
  push:
    branches:
      - main
jobs:
  publish:
    name: Publish Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: 'actions/checkout@v4'
      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      - name: Bump Package Version & Publish
        uses: 'g33kio/npm-version-bump@master'
        with:
          tag-version: 'true'
          tag-prefix: 'v'
          major-keywords: 'major,+++'
          minor-keywords: 'minor,++'
          patch-keywords: 'patch,+'
```
