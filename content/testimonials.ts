/**
 * Testimonials Content
 * 
 * Edit this file to update testimonials displayed on the site.
 * Images should be local or use a reliable CDN.
 */

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
  company: string;
  image?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    text: "Jay transformed our vague data requirements into a high-performance analytics engine. His ability to bridge technical complexity with business value is unmatched.",
    author: "Sarah Chen",
    role: "CTO",
    company: "Nexus AI",
    // Using placeholder - replace with actual images
    image: "/testimonials/sarah.jpg",
  },
  {
    id: "2",
    text: "The dashboard Jay built isn't just functional; it's a work of art. The attention to detail in the user experience made adoption seamless across our organization.",
    author: "Marcus Thorne",
    role: "Product Director",
    company: "Vanguard Systems",
    image: "/testimonials/marcus.jpg",
  },
  {
    id: "3",
    text: "Working with Jay was a masterclass in modern engineering. He delivered a scalable, future-proof solution that cut our processing time by 60%.",
    author: "Elena Rodriguez",
    role: "VP of Engineering",
    company: "Streamline Data",
    image: "/testimonials/elena.jpg",
  },
];

