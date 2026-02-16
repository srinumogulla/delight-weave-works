import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "New York, USA",
    rating: 5,
    text: "Being away from India, I always missed participating in temple rituals. This platform has been a blessing! The Ganapathi Homam performed for my business gave me immense peace.",
    avatar: "R",
    pooja: "Ganapathi Homam",
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "London, UK",
    rating: 5,
    text: "The live streaming quality was excellent. I could see every detail of the Navagraha pooja. The priest explained each step in English which made it even more meaningful.",
    avatar: "P",
    pooja: "Navagraha Pooja",
  },
  {
    id: 3,
    name: "Venkat Rao",
    location: "Singapore",
    rating: 5,
    text: "My mother wanted a Satyanarayan Katha but couldn't travel. We booked through this platform and the whole family watched together. She was so happy with tears in her eyes.",
    avatar: "V",
    pooja: "Satyanarayan Katha",
  },
  {
    id: 4,
    name: "Anita Desai",
    location: "Dubai, UAE",
    rating: 5,
    text: "The personalized sankalpa with our family names and gotra made it feel like we were right there at the temple. Received the video within an hour of completion.",
    avatar: "A",
    pooja: "Rudra Abhishekam",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our <span className="text-primary">Devotees</span> Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied devotees who have experienced the divine through our platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="bg-card border-border hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-accent text-accent"
                    />
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-primary font-medium">
                    {testimonial.pooja}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
