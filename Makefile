-include .env
-include vendors/deps-pipelines/shared/Makefile
-include Makefile.local

APP_NAME=frontend
ARTIFACTORY_HOST := $(ARTIFACTORY_HOST)
hash := $(shell git rev-parse HEAD)
date := $(shell date)
tag := $(shell git describe --always || echo "latest")
commit_short_sha := "$(CI_COMMIT_SHORT_SHA)"
NO_DEV_DOCKER_IMAGE = frontend

.PHONY:start
start: | prereq build run build-tests  shell ci clean

.PHONY: prereq build run build-tests tests shell ci clean

prereq:
	docker network create deps-network || true
	docker compose -f docker-compose.yml down -v

build:
	@#@ Build Frontend service
	COMPOSE_DOCKER_CLI_BUILD=1
	DOCKER_BUILDKIT=1
	docker compose build \
	--build-arg BUILD_HASH=$(hash) \
	--build-arg BUILD_TAG=$(tag) \
	--build-arg BUILD_DATE="$(date)" \
	--build-arg ENABLE_SOURCE_MAP="$(ENABLE_SOURCE_MAP)"

run: | prereq
	@#@ Run services
	docker compose up -d

build-tests:
	@#@ Build project for tests
	docker compose -f docker-compose.yml build $(APP_NAME)

.PHONY: push
push:
	$(call push_service,frontend)

.PHONY: tag
tag:
	$(call tag_service,frontend)

.PHONY: pull
pull:
	$(call pull_service,frontend)

shell:
	@#@ Open shell
	docker compose run --rm $(APP_NAME) sh

ci: | prereq format-check lint mypy-check tests
	@#@ Run CI checks
	@echo "Done"

.PHONY: deploy
deploy:
	ssh $(project)@${DEPLOY_HOST} "cd /media/data/$(env) && make update-frontend"

clean:
	@#@ Clean junk files
	find . -name \*.pyc -delete
	find . -name __pycache__ -exec rm -rf {} \;
	rm -rf *.egg-info

.PHONY: helm-upgrade-service
helm-upgrade-service:
	helm upgrade --install $(CI_PROJECT_NAME) .helm/services \
        --values .helm/services/values.yaml $(ADDITIONAL_VALUES) \
        --set registry=$(REPOSITORY_URL) \
        --set image.tag=$(commit_short_sha) \
        --set vault_settings.enabled=$(VAULT_ENABLE) \
        --set frontend_settings.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL=$(GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL) \
        --set frontend_settings.ONE_DRIVE_SERVICE_ACCOUNT_EMAIL=$(ONE_DRIVE_SERVICE_ACCOUNT_EMAIL) \
        --timeout 300s \
        --atomic \
        --wait \
        --debug \
        --namespace $(NAMESPACE)

.PHONY: helm-deployment-rollback
helm-deployment-rollback:
	helm rollback --namespace $(NAMESPACE) $(CI_PROJECT_NAME) 0

.PHONY: helm-rollback
helm-rollback:
	make helm-deployment-rollback

.PHONY: helm-upgrade
helm-upgrade:
	make helm-upgrade-service

testdkube := $(shell kubectl config current-context)
ifeq ($(testdkube), rancher-desktop)
.PHONY: skaffold
skaffold:
	cd skaffold && skaffold run -f skaffold.yaml
endif
