import { useState, useEffect } from 'react';
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
  Phone,
  Plus,
  Minus,
  X,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { useServices, Service } from '@/hooks/useServices';
import { useStaff, Staff } from '@/hooks/useStaff';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';

type BookingStep = 'service' | 'staff' | 'datetime' | 'details' | 'confirm';

const BookingPage = () => {
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const { services, categories, loading: servicesLoading } = useServices();
  const { staff, loading: staffLoading } = useStaff();
  const { user } = useAuth();

  // Auto-fill user details when user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || prev.name,
        email: user.email || prev.email,
        phone: user.user_metadata?.phone || prev.phone,
      }));
    }
  }, [user]);

  const activeServices = services.filter(s => s.is_active);
  const activeStaff = staff.filter(s => s.is_active);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const steps: { key: BookingStep; label: string }[] = [
    { key: 'service', label: 'Services' },
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

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const selectedStaffMember = activeStaff.find(s => s.id === selectedStaff);

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
        <div className="max-w-6xl mx-auto">
          {/* Service Selection - New Layout */}
          {step === 'service' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-2 text-center">
                Choose Your Treatments
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Select one or more services from our premium offerings
              </p>

              {servicesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Services List */}
                  <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
                    <ScrollArea className="h-[500px]">
                      {categories.map(category => {
                        const categoryServices = activeServices.filter(s => s.category === category);
                        if (categoryServices.length === 0) return null;

                        return (
                          <div key={category} className="border-b border-border last:border-b-0">
                            {/* Category Header */}
                            <div className="bg-muted/50 px-6 py-3 sticky top-0 z-10">
                              <h3 className="font-semibold text-foreground">{category}</h3>
                            </div>

                            {/* Services in Category */}
                            <div className="divide-y divide-border">
                              {categoryServices.map(service => {
                                const isSelected = selectedServices.some(s => s.id === service.id);
                                return (
                                  <div
                                    key={service.id}
                                    className={cn(
                                      "flex items-center justify-between px-6 py-4 transition-colors",
                                      isSelected && "bg-primary/5"
                                    )}
                                  >
                                    <div className="flex-1 min-w-0 mr-4">
                                      <h4 className="font-medium text-foreground">{service.name}</h4>
                                      <p className="text-sm text-muted-foreground line-clamp-1">
                                        {service.description || 'No description'}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                          <Clock className="h-3 w-3" />
                                          {service.duration} min
                                        </span>
                                        <span className="text-sm font-semibold text-primary">
                                          {Number(service.price) === 0 ? 'Free' : `₱${service.price}`}
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      variant={isSelected ? "default" : "outline"}
                                      size="icon"
                                      className="shrink-0 h-10 w-10 rounded-full"
                                      onClick={() => toggleService(service)}
                                    >
                                      {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {activeServices.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No services available at the moment.</p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>

                  {/* Selected Services Panel */}
                  <div className="glass-card rounded-2xl p-6 h-fit lg:sticky lg:top-24">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Selected Services</h3>
                    </div>

                    {selectedServices.length === 0 ? (
                      <p className="text-muted-foreground text-sm py-8 text-center">
                        No services selected yet. Click the + button to add services.
                      </p>
                    ) : (
                      <>
                        <div className="space-y-3 mb-6">
                          {selectedServices.map(service => (
                            <div 
                              key={service.id}
                              className="flex items-start justify-between gap-2 p-3 rounded-lg bg-muted/50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm">{service.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">{service.duration} min</span>
                                  <span className="text-xs font-semibold text-primary">
                                    ₱{service.price}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeService(service.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-border pt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Duration</span>
                            <span className="font-medium text-foreground">{totalDuration} min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Price</span>
                            <span className="font-semibold text-primary text-lg">₱{totalPrice}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <Button 
                  variant="hero" 
                  size="lg"
                  disabled={selectedServices.length === 0}
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

              {staffLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

                  {activeStaff.map(s => (
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
                      <p className="text-muted-foreground text-sm line-clamp-2">{s.bio || 'No bio available'}</p>
                    </button>
                  ))}

                  {activeStaff.length === 0 && (
                    <div className="col-span-full glass-card rounded-xl p-12 text-center">
                      <p className="text-muted-foreground">No specialists available at the moment.</p>
                    </div>
                  )}
                </div>
              )}

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

          {/* Details - Auto-filled for logged in users */}
          {step === 'details' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-serif font-semibold text-foreground mb-2 text-center">
                Your Details
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                {user ? 'Please verify your contact information' : 'Please provide your contact information'}
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
                      readOnly={!!user?.email}
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
                  <div className="py-3 border-b border-border">
                    <span className="text-muted-foreground text-sm">Services</span>
                    <div className="mt-2 space-y-2">
                      {selectedServices.map(service => (
                        <div key={service.id} className="flex justify-between">
                          <span className="text-foreground">{service.name}</span>
                          <span className="text-muted-foreground">₱{service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between py-3 border-b border-border">
                    <span className="text-muted-foreground">Specialist</span>
                    <span className="font-semibold text-foreground">
                      {selectedStaff === 'any' ? 'Any Available' : selectedStaffMember?.name}
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
                    <span className="text-muted-foreground">Total Duration</span>
                    <span className="font-semibold text-foreground">{totalDuration} minutes</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-muted-foreground">Total Price</span>
                    <span className="font-semibold text-primary text-xl">₱{totalPrice}</span>
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
