import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'hubspot-form';


  constructor(private renderer: Renderer2, private el: ElementRef, private http: HttpClient) { }

  ngOnInit() {
    this.addHubSpotScript();
  }

  addHubSpotScript() {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = '//js-eu1.hsforms.net/forms/embed/v2.js';
    script.charset = 'utf-8';
    script.onload = () => {
      this.renderHubSpotForm();
    };
    this.renderer.appendChild(this.el.nativeElement, script);
  }

  renderHubSpotForm() {
    const hbspt = (window as any).hbspt;
    if (hbspt) {
      hbspt.forms.create({
        region: "eu1",
        portalId: "145213308",
        formId: "421dec96-2be1-440d-9a9f-cdadbb63bd65",
        target: '#hubspotFormContainer',
        onFormReady: () => {
          this.customizeSubmitButton();
        }
      });
    }
  }

  customizeSubmitButton() {
    setTimeout(() => {
      const iframe = this.el.nativeElement.querySelector('iframe[id^="hs-form-iframe-"]');
      if (iframe) {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          if (iframeDoc) {
            const style = iframeDoc.createElement('style');
            style.innerHTML = `
              .hs-button {
                background-color: #3498db !important; /* Change this to your desired color */
              }
            `;
            iframeDoc.head.appendChild(style);
          }
        } catch (e) {
          console.error('Unable to access iframe content:', e);
        }
      }
    }, 1000); // Add a slight delay to ensure the iframe is fully loaded
  }

  onSubmit(form: any) {
    if (form.valid) {
      const formData = form.value;
      const hubspotData = {
        fields: [
          { name: 'firstname', value: formData.firstName },
          { name: 'lastname', value: formData.lastName },
          { name: 'email', value: formData.email },
          { name: 'phone', value: formData.phone || '' }, // Not required
          { name: 'message', value: formData.message || '' } // Not required
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      };

      this.submitToHubspot(hubspotData).subscribe(
        response => {
          console.log('Form submitted successfully to HubSpot', response);
          form.resetForm();
        },
        error => {
          console.error('Error submitting form to HubSpot', error);
        }
      );
    }
  }

  submitToHubspot(data: any) {
    const portalId = '145213308';  // Replace with your actual portal ID
    const formId = '421dec96-2be1-440d-9a9f-cdadbb63bd65';      // Replace with your actual form ID
    const apiUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;



    return this.http.post(apiUrl, data);
  }

}
