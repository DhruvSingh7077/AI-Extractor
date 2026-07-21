from whitenoise.storage import CompressedManifestStaticFilesStorage


class NonStrictManifestStaticFilesStorage(CompressedManifestStaticFilesStorage):
    """
    Same as whitenoise's storage, but skips any file whose post-processing
    fails (e.g. a vendored .js/.css referencing a .map file that isn't
    actually shipped in the package) instead of crashing the whole
    collectstatic run. This catches ALL such cases at once, rather than
    needing a stub file for every individual missing reference.
    """

    def post_process(self, *args, **kwargs):
        files = super().post_process(*args, **kwargs)
        for name, hashed_name, processed in files:
            if isinstance(processed, Exception):
                continue
            yield name, hashed_name, processed