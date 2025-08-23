from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging
import os
import smtplib
from typing import Optional
from livekit.agents import function_tool, RunContext
import requests
from langchain_community.tools import DuckDuckGoSearchRun

@function_tool
async def get_weather(
        context: RunContext,
        city: str) -> str:
    """
    Get the current weather for a specified city.
    """
    try:
        response = requests.get(
            f"http://wttr.in/{city}?format=3")
        if response.status_code == 200:
            logging.info(f"Weather in {city}: {response.text}")
            return response.text.strip()
        else:
            logging.error(f"Failed to get weather for {city}: {response.status_code}")
            return f"Could not retrieve weather data for {city}."
    except Exception as e:
        logging.error(f"Error fetching weather data: {e}")
        return f"An error occurred while fetching the weather for {city}."


@function_tool    
async def search_web(
        context: RunContext,
        query: str) -> str:
    """
    Search the web using DuckDuckGo.
    """
    try: 
        results = DuckDuckGoSearchRun().run(tool_input=query)
        logging.info(f"Search results for '{query}': {results}")
        return results
    except Exception as e:
        logging.error(f"Error during web search: {e}")
        return "An error occurred while searching the web."



@function_tool
async def email_tool(
        context: RunContext,
        to_email: str,
        subject: str,
        message: str,
        cc_email: Optional[str] = None) -> str:
    """
    Send an email through Gmail SMTP.

    Args:
        to_email (str): Recipient's email address.
        subject (str): Subject of the email.
        message (str): Body of the email.
        cc_email (Optional[str]): CC email address.
    """
    try:
        # gmail SMTP configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        gmail_user = os.getenv("GMAIL_USER")
        gmail_password = os.getenv("GMAIL_PASSWORD")

        if not gmail_user or not gmail_password:
            logging.error("GMAIL credentials not set.")
            return "email sending failed, gmail credentials not set."
        
        msg=MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(gmail_user, gmail_password)

        text = msg.as_string()
        server.sendmail(gmail_user, to_email, text)
        if cc_email:
            msg['CC'] = cc_email
            server.sendmail(gmail_user, cc_email, text)
        server.quit()  
     
        # Placeholder for email sending logic
        logging.info(f" email sent successfully to {to_email} with subject '{subject}'")
        # Simulate email sending
        return f"Email sent to {to_email} with subject '{subject}'."
    
    except smtplib.SMTPAuthenticationError:
        logging.error("SMTP Authentication Error: Check your Gmail credentials.")
        return "Email sending failed, check your Gmail credentials."
    except smtplib.SMTPException as e:
        logging.error(f"SMTP Exception: {e}")
        return f"An error occurred while sending the email: SMTP error - {str(e)}"
    except Exception as e:
        logging.error(f"Error sending email: {e}")
        return f"An error occurred while sending the email: {str(e)}"