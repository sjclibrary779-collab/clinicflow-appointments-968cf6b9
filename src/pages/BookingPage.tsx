import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  ArrowLeft, 
  Clock, 
  Calendar,
  Check,
  ChevronRight,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { mockServices, mockStaff } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

type BookingStep = 'service' | 'staff' | 'datetime' | 'details' | 'confirm';

const BookingPage = () => {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const service = mockServices.find(s => s.id === selectedService);
  const staff = mockStaff.find(s => s.id === selectedStaff);

  const availableStaff = selectedService 
    ? mockStaff.filter(s => s.serviceIds.includes(selectedService))
    : [];

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const steps: { key: BookingStep; label: string }[] = [
    { key: 'service', label: 'Service' },
    { key: 'staff', label: 'Specialist' },
    { key: 'datetime', label: 'Date & Time' },
    { key: 'details', label: 'Your Details' },
    { key: 'confirm', label: 'Confirm' }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex].key);
    }
  };

  const categories = [...new Set(mockServices.map(s => s.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-semibold text-foreground">Lumina</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {steps.map((s, index) => (
              <div key={s.key} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2",
                  index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    index < currentStepIndex 
                      ? "bg-primary text-primary-foreground" 
                      : index === currentStepIndex
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {index < currentStepIndex ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className="hidden md:block text-sm font-medium">{s.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Service Selection */}
          {step === 'service' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-2 text-center">
                Choose Your Treatment
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Select from our range of premium aesthetic services
              </p>

              {categories.map(category => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{category}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {mockServices.filter(s => s.category === category).map(service => (
                      <button
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={cn(
                          "glass-card rounded-xl p-5 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                          selectedService === service.id && "ring-2 ring-primary bg-primary/5"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-foreground">{service.name}</h4>
                          <span className="font-semibold text-primary">
                            {service.price === 0 ? 'Free' : `₱${service.price}`}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {service.duration} minutes
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-8">
                <Button 
                  variant="hero" 
                  size="lg"
                  disabled={!selectedService}
                  onClick={handleNext}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Staff Selection */}
          {step === 'staff' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-2 text-center">
                Choose Your Specialist
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Select a specialist or let us assign the best available
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <button
                  onClick={() => setSelectedStaff('any')}
                  className={cn(
                    "glass-card rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg",
                    selectedStaff === 'any' && "ring-2 ring-primary bg-primary/5"
                  )}
                >
                  <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground text-lg mb-1">Any Available</h4>
                  <p className="text-muted-foreground text-sm">
                    We'll assign the first available specialist
                  </p>
                </button>

                {availableStaff.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStaff(s.id)}
                    className={cn(
                      "glass-card rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg",
                      selectedStaff === s.id && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
                      <span className="text-xl font-semibold text-accent-foreground">
                        {s.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground text-lg mb-1">{s.name}</h4>
                    <p className="text-primary text-sm font-medium mb-2">{s.title}</p>
                    <p className="text-muted-foreground text-sm line-clamp-2">{s.bio}</p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="lg" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  variant="hero" 
                  size="lg"
                  disabled={!selectedStaff}
                  onClick={handleNext}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Date & Time Selection */}
          {step === 'datetime' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-2 text-center">
                Select Date & Time
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Choose your preferred appointment slot
              </p>

              {/* Date Selection */}
              <div className="mb-8">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Select Date
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
                  {dates.map(date => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "flex-shrink-0 w-20 rounded-xl p-4 text-center transition-all duration-200",
                        selectedDate?.toDateString() === date.toDateString()
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card border border-border hover:border-primary/50"
                      )}
                    >
                      <p className="text-xs font-medium opacity-80">{format(date, 'EEE')}</p>
                      <p className="text-2xl font-semibold">{format(date, 'd')}</p>
                      <p className="text-xs opacity-80">{format(date, 'MMM')}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-8">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Select Time
                  </h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "rounded-lg py-3 px-4 text-sm font-medium transition-all duration-200",
                          selectedTime === time
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-card border border-border hover:border-primary/50"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button variant="outline" size="lg" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  variant="hero" 
                  size="lg"
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleNext}
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Details */}
          {step === 'details' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-2 text-center">
                Your Details
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Please provide your contact information
              </p>

              <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      rows={3}
                      placeholder="Any special requests or notes"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" size="lg" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  variant="hero" 
                  size="lg"
                  disabled={!formData.name || !formData.email || !formData.phone}
                  onClick={handleNext}
                >
                  Review Booking
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirm' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-2 text-center">
                Confirm Your Booking
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Please review your appointment details
              </p>

              <div className="glass-card rounded-2xl p-8 max-w-lg mx-auto mb-8">
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-semibold text-foreground">{service?.name}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Specialist</span>
                    <span className="font-semibold text-foreground">
                      {selectedStaff === 'any' ? 'Any Available' : staff?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-semibold text-foreground">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-semibold text-foreground">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold text-foreground">{service?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold text-primary text-xl">
                        {service?.price === 0 ? 'Free' : `₱${service?.price}`}
                      </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-3">Contact Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {formData.name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {formData.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="lg" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => {
                    // Here you would submit the booking
                    alert('Booking confirmed! You will receive a confirmation email shortly.');
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
