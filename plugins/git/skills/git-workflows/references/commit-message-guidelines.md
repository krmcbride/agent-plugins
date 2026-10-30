# Commit Message Guidelines

Follow the project's established style. Otherwise use Conventional Commits (`type(scope): description`) when semantic categories serve release tooling, or a subsystem subject (`area[/subarea]: description`) when ownership is more useful, as in infrastructure and dotfiles repositories.

Use an imperative subject, lowercase after the colon, without a final period; aim for about 72 characters. Choose a stable subsystem rather than a filename.

Scale the body to the change: omit it for a self-explanatory subject, otherwise explain motivation, behavior, and consequences in one sentence or a few short paragraphs. Wrap body lines at 72 characters. Avoid repeating the diff.

Describe the exact change represented by each commit. For a series, derive each message from that commit's own diff, without describing later phases or combining distinct commits into an aggregate explanation.
