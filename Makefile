NAME ?= flux

.PHONY: install uninstall lint fmt test-json package

install:
	install -m 755 bin/flux /usr/local/bin/$(NAME)
	@echo "Installed as $(NAME)."

uninstall:
	rm -f /usr/local/bin/$(NAME)
	@echo "Uninstalled $(NAME)."

lint:
	shellcheck bin/flux || true

fmt:
	shfmt -w bin/flux || true

test-json:
	jq . templates/site-fullstack.template.json >/dev/null
	jq . templates/site-static.template.json >/dev/null
	jq . security/firewall.json >/dev/null
	jq . examples/sites/transfer-hub.json >/dev/null
	jq . examples/sites/nickduchatinier.json >/dev/null
	@echo "All JSON validated."

package:
	rm -f ../flux-repo.zip
	cd .. && zip -r flux-repo.zip flux -x "*/.git/*"
	@echo "Wrote ../flux-repo.zip"
