
// src/app/about/page.tsx
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Bot, CalendarSearch, Bell, Rss, Mail, Rocket, Target, Star, BrainCircuit, Heart, Briefcase, Award, TrendingUp, Group, Map, Code, Milestone, Lightbulb, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from 'next/link';

const founders = [
    {
        name: "Aman",
        role: "Co-Founder & Tech Lead",
        quote: "I wanted to create something that would make discovering tech events as easy as opening WhatsApp.",
        description: "A passionate full-stack developer and community builder who believes that great technology emerges from great communities. With experience in modern web technologies and a deep love for Mumbai's tech ecosystem, Aman recognized the need for a centralized platform that could serve the city's diverse tech professionals."
    },
    {
        name: "Riya Tiwari",
        role: "Co-Founder & Community Strategist",
        quote: "Every great developer started by attending their first tech meetup. We're here to make sure no one misses that opportunity.",
        description: "A tech enthusiast and community advocate who understands the pulse of Mumbai's developer ecosystem. Riya brings strategic thinking and user-centric design to ensure our platform serves real community needs, not just tech for tech's sake."
    }
]

const whyWeBuiltThis = {
    problem: [
        "Tech events scattered across multiple platforms",
        "No single source of truth for Mumbai's tech calendar",
        "Amazing events going unnoticed due to poor discoverability",
        "Community fragmentation across different channels",
        "Missed networking opportunities due to information gaps"
    ],
    solution: [
        "One Platform, All Events: Curated collection of Mumbai's best tech events",
        "AI-Powered Curation: Smart event discovery and categorization",
        "Community-First Approach: Built by the community, for the community",
        "Real-Time Updates: Never miss an event again",
        "Easy Discovery: Search, filter, and find events that match your interests"
    ]
}

const eventCategories = [
    { title: "Workshops & Bootcamps", description: "Hands-on learning experiences" },
    { title: "Tech Talks & Conferences", description: "Industry insights and thought leadership" },
    { title: "Networking Meetups", description: "Connect with like-minded professionals" },
    { title: "Hackathons", description: "Build, innovate, and compete" },
    { title: "Career Events", description: "Job fairs, interview prep, and career guidance" },
    { title: "Community Gatherings", description: "Social events that bring techies together" }
];

const techCategories = [
    "Frontend & Backend Development",
    "Mobile App Development",
    "Cloud & DevOps",
    "Data Science & Machine Learning",
    "Blockchain & Web3",
    "UI/UX Design",
    "Product Management",
    "Startup & Entrepreneurship",
    "Emerging Technologies (AI, IoT, AR/VR)",
];

const goals = {
    shortTerm: [
        "Feature 100+ quality tech events monthly",
        "Build a community of 10,000+ active users",
        "Partner with Mumbai's top tech companies and meetup organizers",
        "Launch mobile app for on-the-go event discovery",
        "Introduce personalized event recommendations"
    ],
    longTerm: [
        "Become Mumbai's definitive tech events platform",
        "Expand to other Indian tech hubs (Bangalore, Delhi, Hyderabad, Pune)",
        "Launch community job board connecting event attendees with opportunities",
        "Create mentorship programs linking senior and junior developers",
        "Host our own flagship मुंबई Event Techies conference"
    ]
}

const communityGuidelines = [
    "All skill levels welcome - from complete beginners to tech veterans",
    "Respectful networking - genuine connections over transactional relationships",
    "Knowledge sharing - teach what you learn, learn what others teach",
    "Diversity celebration - embracing Mumbai's incredible diversity",
    "Quality over quantity - we curate events that truly add value"
]

const futureFeatures = [
    { icon: Star, title: "Personalized Event Feed", description: "AI-powered recommendations based on your interests" },
    { icon: CalendarSearch, title: "Community Calendar Sync", description: "Add events directly to your Google/Apple calendar" },
    { icon: Users, title: "Event Check-ins", description: "See who else is attending and connect beforehand" },
    { icon: Code, title: "Skill-Based Matching", description: "Find events and meetups for your experience level" },
    { icon: MessageCircle, title: "Event Reviews & Ratings", description: "Community-driven event quality feedback" },
    { icon: Bot, title: "Mobile App", description: "Native iOS and Android apps for seamless event discovery" },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-1 mt-16">
        <div className="bg-primary text-primary-foreground py-16 text-center">
            <div className="container">
                <Rocket className="mx-auto h-12 w-12 mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold font-headline">About मुंबई Event Techies</h1>
                <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-primary-foreground/80">
                    Your guide to the heart of Mumbai's vibrant tech scene.
                </p>
            </div>
        </div>

        <div className="container py-12 md:py-20">
          <div className="max-w-4xl mx-auto space-y-12">

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle>🚀 Our Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        मुंबई Event Techies was born from a simple observation: Mumbai's tech community is incredibly vibrant, but finding quality tech events was scattered and chaotic. As passionate technologists living in the heart of India's financial capital, we found ourselves constantly missing amazing workshops, meetups, and conferences simply because we didn't know they existed.
                    </p>
                    <p>
                        That's when we decided to change the game.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>👥 Meet the Founders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    {founders.map(founder => (
                        <div key={founder.name} className="flex flex-col sm:flex-row items-start gap-6 bg-secondary/50 p-6 rounded-lg">
                           <div className="flex-shrink-0 w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                                <Users className="w-10 h-10 text-muted-foreground" />
                           </div>
                           <div className="flex-1">
                                <h3 className="text-xl font-bold font-headline">{founder.name}</h3>
                                <p className="text-sm text-primary font-semibold mb-2">{founder.role}</p>
                                <p className="text-muted-foreground italic border-l-4 border-primary pl-4 mb-3">"{founder.quote}"</p>
                                <p className="text-muted-foreground text-sm">{founder.description}</p>
                           </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>🎯 Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p className="text-lg font-semibold text-foreground">
                       To democratize access to Mumbai's tech events and build bridges within our community.
                    </p>
                    <p>
                        We believe that every developer, designer, product manager, and tech enthusiast in Mumbai deserves to know about the amazing learning opportunities happening around them. Whether you're a fresher looking for your first tech meetup or a seasoned professional seeking the latest industry insights, मुंबई Event Techies is your gateway to the city's tech ecosystem.
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl text-destructive">The Problem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                          {whyWeBuiltThis.problem.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                    </CardContent>
                </Card>
                 <Card className="border-green-500/50">
                    <CardHeader>
                        <CardTitle className="text-2xl text-green-600">Our Solution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                           {whyWeBuiltThis.solution.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>🌟 What You Can Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold mb-3">🎪 Diverse Event Coverage</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {eventCategories.map((cat, i) => (
                                <div key={i} className="p-4 bg-secondary/50 rounded-lg">
                                    <h4 className="font-bold">{cat.title}</h4>
                                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold mb-3">🎨 Categories We Cover</h3>
                        <div className="flex flex-wrap gap-2">
                             {techCategories.map((cat, i) => (
                                <div key={i} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">{cat}</div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>🎯 Our Goals</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-3">Short-Term (Next 6 Months)</h3>
                        <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            {goals.shortTerm.map(goal => <li key={goal}>{goal}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3">Long-Term (Next 2 Years)</h3>
                         <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                            {goals.longTerm.map(goal => <li key={goal}>{goal}</li>)}
                        </ul>
                    </div>
                    <div className="md:col-span-2 text-center pt-4 border-t">
                        <h3 className="text-xl font-bold text-primary">Ultimate Dream</h3>
                        <p className="text-muted-foreground mt-1">Transform Mumbai into India's most connected tech ecosystem where every developer knows about every opportunity to learn, grow, and connect.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>🏙️ Why Mumbai?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>Mumbai isn't just India's financial capital—it's rapidly becoming a tech powerhouse. With major companies like Tata Consultancy Services, Reliance Jio, and hundreds of startups calling Mumbai home, our city has a unique blend of traditional business acumen and cutting-edge innovation.</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>🤝 Community Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                      {communityGuidelines.map((guideline, index) => (
                        <li key={index}>{guideline}</li>
                      ))}
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>🔮 Future Features Coming Soon</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {futureFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <feature.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold">{feature.title}</h3>
                          </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="text-center bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle>📞 Get In Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="max-w-2xl mx-auto text-primary-foreground/80">
                        Have an amazing event to share? Found a bug? Want to collaborate?
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                         <Button variant="secondary">Email: hello@mumbai-event-techies.com</Button>
                         <Button variant="secondary">Twitter: @MumbaiEventTech</Button>
                    </div>
                </CardContent>
            </Card>
            
            <div className="text-center text-muted-foreground text-sm">
                <p>Built with ❤️ in Mumbai, for Mumbai's tech community.</p>
                <p>Last updated: August 2025</p>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


    