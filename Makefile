.PHONY: docker-build
docker-build: ## Build docker image 'typo3-documentation-browsersync:local' for local debugging
	docker build -t typo3-documentation-browsersync:local .
    #docker composer up --build

.PHONY: docker-enter
docker-enter: ## Enter a locally build image
	docker run -it --entrypoint=sh --rm \
           -v "./Input:/project/Documentation" \
           -v "./Output:/project/Documentation-GENERATED-temp" \
           typo3-documentation-browsersync:local

.PHONY: render-docs
render-docs: ## Render Documentation using typo3-documentation/render-guides
	docker run --rm --pull always \
	       -v "./Input:/project/Documentation" \
	       -v "./Output:/project/Documentation-GENERATED-temp" \
           ghcr.io/typo3-documentation/render-guides:latest  --no-progress Documentation

# Within the container:
# docker run --rm --pull always -v "./Documentation:/project/Documentation" -v "./Documentation-GENERATED-temp:/project/Documentation-GENERATED-temp" ghcr.io/typo3-documentation/render-guides:latest --no-progress Documentation
