import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does online pooja work?",
    answer:
      "When you book a pooja, our verified Purohit performs the ritual at a sacred temple on your behalf. Your personalized sankalpa (sacred resolution) with your name, gotra, and intention is taken at the beginning. You can watch the entire ritual live via video stream and receive a recording afterward.",
  },
  {
    question: "Is online pooja as effective as being physically present?",
    answer:
      "Yes, according to Vedic scriptures, the efficacy of a ritual depends on the devotion and proper execution by the priest, not physical presence. The sankalpa dedicates the pooja's benefits to you. Many ancient texts support performing rituals through qualified intermediaries when physical presence isn't possible.",
  },
  {
    question: "Who performs the poojas?",
    answer:
      "All our poojas are performed by verified Purohits who are traditionally trained in Vedic rituals. Each priest has been vetted for their knowledge, authenticity, and dedication to proper ritual performance. We work with priests from renowned temples across India.",
  },
  {
    question: "How do I watch the live pooja?",
    answer:
      "After booking, you'll receive a unique link to join the live stream at the scheduled time. You can watch from any device - phone, tablet, or computer. The stream includes audio of the mantras being chanted. After completion, you'll receive the full video recording on WhatsApp.",
  },
  {
    question: "What details do I need to provide for the sankalpa?",
    answer:
      "For the sankalpa, we need your full name, gotra (family lineage - if unknown, we use 'Kashyapa'), nakshatra (birth star - optional), and your specific prayer intention. This personalizes the ritual and dedicates its benefits to you and your family.",
  },
  {
    question: "Can I book a pooja for someone else?",
    answer:
      "Absolutely! Many devotees book poojas for their family members, friends, or loved ones. You just need to provide the beneficiary's details for the sankalpa. This is a beautiful way to send spiritual blessings to someone who needs them.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major payment methods including credit/debit cards, UPI, net banking, and international cards. All payments are processed securely. You'll receive a receipt and booking confirmation via email immediately after payment.",
  },
  {
    question: "Can I reschedule or cancel a booking?",
    answer:
      "Yes, you can reschedule up to 24 hours before the scheduled pooja time at no extra cost. Cancellations made 48+ hours in advance receive a full refund. Cancellations within 48 hours receive store credit for future bookings.",
  },
];

export function FAQ() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
              Questions
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-muted-foreground">
              Find answers to common questions about our online pooja services
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg border border-border px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
