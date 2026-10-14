
      const observer = new IntersectionObserver(
        (es) =>
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              observer.unobserve(e.target);
            }
          }),
        { threshold: 0.14 },
      );
      document.querySelectorAll(".reveal").forEach((e) => observer.observe(e));
      if(document.body.classList.contains('home-page') &&
         !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        const sequences=[
          ['.home-vision-image',[
            {opacity:.25,transform:'translateX(-28px)',clipPath:'inset(0 12% 0 0)'},
            {opacity:1,transform:'translateX(0)',clipPath:'inset(0 0 0 0)'}]],
          ['.home-vision-copy',[
            {opacity:.2,transform:'translateY(28px)'},
            {opacity:1,transform:'translateY(0)'}]],
          ['.home-services>.shell>.section-heading',[
            {opacity:.2,transform:'translateY(18px)'},
            {opacity:1,transform:'translateY(0)'}]],
          ['.home-service-card:first-child',[
            {opacity:.2,transform:'translateX(-32px)'},
            {opacity:1,transform:'translateX(0)'}]],
          ['.home-service-card:nth-child(2)',[
            {opacity:.2,transform:'translateX(32px)'},
            {opacity:1,transform:'translateX(0)'}]],
          ['.home-values blockquote',[
            {opacity:.15,transform:'scale(.97)'},
            {opacity:1,transform:'scale(1)'}]],
          ['.customer-logo-section .section-heading',[
            {opacity:.2,transform:'translateY(18px)'},
            {opacity:1,transform:'translateY(0)'}]],
          ['.site-contact .section-heading',[
            {opacity:.2,transform:'translateY(24px)'},
            {opacity:1,transform:'translateY(0)'}]],
          ['.site-contact-form',[{opacity:.2},{opacity:1}]],
          ['.site-footer-grid',[{opacity:.2},{opacity:1}]]
        ];
        const motions=new Map();
        const scrollObserver=new IntersectionObserver(entries=>{
          entries.forEach(entry=>{
            if(!entry.isIntersecting)return;
            entry.target.animate(motions.get(entry.target),{
              duration:1100,easing:'cubic-bezier(.25,.65,.3,1)'
            });
            entry.target.dataset.motionPlayed='true';
            scrollObserver.unobserve(entry.target);
          });
        },{threshold:.12});
        sequences.forEach(([selector,frames])=>{
          document.querySelectorAll(selector).forEach(element=>{
            motions.set(element,frames);
            scrollObserver.observe(element);
          });
        });
      }
      if (document.body.classList.contains('inner-page') && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const innerMotion = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.animate([{opacity:.5, transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}], {duration:1100,easing:'cubic-bezier(.25,.65,.3,1)'});
            innerMotion.unobserve(entry.target);
          });
        }, {threshold:.12});
        document.querySelectorAll('.inner-hero-media,.service-photo-card,.service-feature-media,.catalog-detail figure').forEach(element => {
          if (!element.closest('body.services-page .catalog-detail')) innerMotion.observe(element);
        });
      }
      const config = {};
      const localDraft = ['localhost', '127.0.0.1', ''].includes(location.hostname);
      const mockMode = localDraft && new URLSearchParams(location.search).get('form-test') === '1';
      const menuButton = document.querySelector(".menu-toggle");
      const nav = document.querySelector("#site-nav");
      const servicesToggle = document.querySelector(".services-toggle");
      const servicesPanel = document.querySelector("#services-menu");
      const closeServices = (returnFocus = false) => {
        if (!servicesToggle || !servicesPanel) return;
        servicesToggle.setAttribute("aria-expanded", "false");
        servicesPanel.hidden = true;
        if (returnFocus) servicesToggle.focus();
      };
      const closeMenu = () => {
        menuButton?.setAttribute("aria-expanded", "false");
        nav?.classList.remove("open");
        closeServices();
      };
      if (menuButton && nav) {
        menuButton.addEventListener("click", () => {
          const open = menuButton.getAttribute("aria-expanded") !== "true";
          menuButton.setAttribute("aria-expanded", String(open));
          nav.classList.toggle("open", open);
          if (!open) closeServices();
        });
        nav.addEventListener("click", (event) => {
          if (event.target.closest("a")) closeMenu();
        });
      }
      if (servicesToggle && servicesPanel) {
        servicesToggle.addEventListener("click", () => {
          const open = servicesToggle.getAttribute("aria-expanded") !== "true";
          servicesToggle.setAttribute("aria-expanded", String(open));
          servicesPanel.hidden = !open;
        });
      }
      document.addEventListener("pointerdown", (event) => {
        if (nav && !nav.contains(event.target)) {
          closeServices();
          if (menuButton?.getAttribute("aria-expanded") === "true") {
            menuButton.setAttribute("aria-expanded", "false");
            nav.classList.remove("open");
          }
        }
      });
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (servicesToggle?.getAttribute("aria-expanded") === "true") {
          closeServices(true);
          return;
        }
        if (menuButton?.getAttribute("aria-expanded") === "true") {
          closeMenu();
          menuButton.focus();
        }
      });
      const forms = [document.querySelector("#contact-form")].filter(Boolean);
      const value = (form, ...names) => {
        for (const name of names) {
          const field = form.elements[name];
          if (field) return field.value.trim();
        }
        return "";
      };
      const statusFor = (form) => form.querySelector(".form-status");
      const setStatus = (form, message, isError = false) => {
        const status = statusFor(form);
        status.textContent = message;
        status.style.color = isError ? "#a61b1b" : "";
      };
      const formPayload = (form) => ({
        name: value(form, "name", "hero-name"),
        phone: value(form, "phone", "hero-phone"),
        company: value(form, "company", "hero-company"),
        site: value(form, "site", "hero-site"),
        detail: [
          value(form, "email") ? "อีเมลติดต่อ: " + value(form, "email") : "",
          value(form, "service") ? "บริการที่สนใจ: " + value(form, "service") : "",
          value(form, "detail", "hero-detail"),
        ].filter(Boolean).join("\n"),
        website: value(form, "website"),
        turnstileToken: form.dataset.turnstileToken || "",
      });
      window.onTurnstileLoad = () => {
        if (!config.turnstileSiteKey || !window.turnstile) return;
        forms.forEach((form) => {
          const slot = form.querySelector(".turnstile-slot");
          if (!slot || slot.dataset.rendered) return;
          slot.dataset.rendered = "true";
          form.dataset.turnstileWidget = window.turnstile.render(slot, {
            sitekey: config.turnstileSiteKey,
            callback: (token) => {
              form.dataset.turnstileToken = token;
              // Keep the submission result visible when a fresh token arrives.
            },
            "expired-callback": () => {
              form.dataset.turnstileToken = "";
            },
            "error-callback": () => {
              form.dataset.turnstileToken = "";
            },
          });
        });
      };
      forms.forEach((form) =>
        form.addEventListener("submit", async (event) => {
          event.preventDefault();
          if (form.dataset.submitting === "true") return;
          if (!form.reportValidity()) return;
          if (!config.formEndpoint || !config.turnstileSiteKey) {
            setStatus(form, "ระบบรับข้อมูลยังไม่เปิดใช้งาน", true);
            return;
          }
          if (localDraft && !mockMode) {
            setStatus(form, "ร่างในเครื่องยังไม่ส่งข้อมูลจริง กรุณาโทรหรืออีเมลเพื่อนัดหมาย", true);
            return;
          }
          const lead = formPayload(form);
          if (!lead.turnstileToken) {
            setStatus(form, "กรุณายืนยันว่าคุณไม่ใช่บอตก่อนส่งข้อมูล", true);
            return;
          }
          const button = form.querySelector("button[type=submit]");
          button.disabled = true;
          form.dataset.submitting = "true";
          setStatus(form, "กำลังส่งข้อมูล...");
          try {
            const response = await fetch(config.formEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(lead),
            });
            const result = await response.json().catch(() => null);
            if (!response.ok || !result || !result.ok) {
              let message = "ระบบยังยืนยันการรับข้อมูลไม่ได้ กรุณาติดต่อทีมงานโดยตรง";
              if (response.status === 400 && result && /verification/i.test(result.message || ""))
                message = "การยืนยันหมดอายุหรือไม่ผ่าน กรุณารอการยืนยันใหม่แล้วกดส่งอีกครั้ง";
              else if (response.status === 400)
                message = "ข้อมูลไม่ครบหรือรูปแบบไม่ถูกต้อง กรุณาตรวจสอบทุกช่อง";
              else if (response.status === 403)
                message = "ระบบปฏิเสธการเชื่อมต่อ กรุณาเปิดเว็บไซต์ตรงใน Chrome หรือ Safari";
              else if (response.status === 429)
                message = "ส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่";
              else if (response.status >= 500)
                message = "ระบบรับข้อมูลขัดข้อง ข้อมูลอาจส่งไปแล้วบางส่วน กรุณาติดต่อทีมงานก่อนส่งซ้ำ";
              const error = new Error(message);
              error.userMessage = message + " (รหัส " + response.status + ")";
              throw error;
            }
            form.reset();
            setStatus(form, "ขอบคุณสำหรับรายละเอียด ทีมงานจะติดต่อกลับโดยเร็วที่สุด");
          } catch (error) {
            setStatus(form, error.userMessage ||
              "เชื่อมต่อระบบรับข้อมูลไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต หรือเปิดเว็บไซต์ใน Chrome/Safari หากยังไม่สำเร็จให้ติดต่อทีมงาน (รหัส NETWORK)", true);
          } finally {
            // Every submitted token is single-use, including failed requests.
            form.dataset.turnstileToken = "";
            try {
              if (window.turnstile && form.dataset.turnstileWidget !== undefined)
                window.turnstile.reset(form.dataset.turnstileWidget);
            } catch (resetError) {
              // A widget reset failure must not turn an accepted lead into an error.
              console.warn("Unable to refresh verification; reload before submitting again.");
            }
            form.dataset.submitting = "false";
            button.disabled = false;
          }
        }),
      );
    

      if (forms.length && config.formEndpoint && config.turnstileSiteKey && (!localDraft || mockMode)) {
        const verification = document.createElement('script');
        verification.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
        verification.async = true;
        document.head.append(verification);
      }
    
