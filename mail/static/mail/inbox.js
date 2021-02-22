document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox

  load_mailbox('inbox');
  submit_compose_form();

});

function submit_compose_form() {
  document.querySelector("#compose-form").onsubmit = function () {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
        load_mailbox('sent');
    });
    return false;
  };
}

function archivations(archiving, email, stat) {

  let Archive = document.createElement('button');
  Archive.innerHTML = archiving;
  Archive.className = 'btn btn-sm btn-outline-primary';
  Archive.id = archiving;
  document.querySelector('#archiving').innerHTML = '';
  document.querySelector('#archiving').append(Archive);
  document.querySelector(`#${archiving}`).addEventListener('click', () => {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: stat
      })
    })
    .then(() => {
      load_mailbox('inbox');
    });
  });
}

function open_email(mailbox) {
  document.querySelectorAll(".email").forEach(email => {
    email.onclick = () => {

      fetch(`/emails/${email.dataset.id}`)
      .then(response => response.json())
      .then(email => {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#email').style.display = 'block';

        document.querySelector('#email-info').innerHTML = 
          'From: '.bold() + `${email.sender}` + '<br>' + 
          'To: '.bold() + `${email.recipients}` + '<br>' + 
          'Subject: '.bold() + `${email.subject}` + '<br>' +
          'Timestamp: '.bold() + `${email.timestamp}` + '<br>';

        document.querySelector('#email-content').value = email.body;

        if (mailbox !== 'sent') {
          if (email.archived === false) {
            archivations('Archive', email, true)
          } else {
            archivations('Unarchive', email, false)
          }
        }

        document.querySelector('#reply-button').onclick = () => {

          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'block';
          document.querySelector('#email').style.display = 'none';
          document.querySelector('#archiving').innerHTML = '';

          document.querySelector('#compose-recipients').value = email.sender;

          if (email.subject.slice(0, 4) === 'Re: ') {
            document.querySelector('#compose-subject').value = email.subject;
          } else {
            document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
          }

          document.querySelector('#compose-body').value = 
`

-----------------------------------
      On ${email.timestamp} ${email.sender} wrote: 
      
${email.body}
`;

          submit_compose_form();
        }

      });
      
      fetch(`/emails/${email.dataset.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      });


    }
  });
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#archiving').innerHTML = '';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#archiving').innerHTML = '';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(email => {
        const element = document.createElement('div');
        element.style.border = "0.5px solid #0000FF";
        element.className = 'email';
        element.dataset.id = email.id;
        if (email.read === true) {
          element.style.backgroundColor = "gray";
        }
        element.innerHTML = `<div>from: ${email.sender}, subject is: ${email.subject}, timestamp: ${email.timestamp}</div>`;
        document.querySelector('#emails-view').append(element);
        //console.log(email)
      });
      open_email(mailbox);
  });
  
  
}