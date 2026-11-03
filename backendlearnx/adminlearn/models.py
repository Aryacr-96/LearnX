from django.db import models
from ckeditor.fields import RichTextField
from django.utils.text import slugify

from django.db import models
from django.utils.text import slugify
from ckeditor.fields import RichTextField


class Blog(models.Model):
    title = models.CharField(max_length=200)

    slug = models.SlugField(
        max_length=220,
        unique=True,
        null=True,
        blank=True
    )

    image = models.ImageField(
        upload_to='blog_images/',
        blank=True,
        null=True
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    description = RichTextField()

    # SEO meta tags
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or "blog"
            new_slug = base_slug
            counter = 1

            while Blog.objects.filter(slug=new_slug).exclude(pk=self.pk).exists():
                new_slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = new_slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Gallery(models.Model):
    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to="gallery_images/", blank=True, null=True)
    video = models.FileField(upload_to="gallery_videos/", blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # ✅ SEO meta tags
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name_plural = "Gallery"

    def __str__(self):
        return self.title


class ContactMessage(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        return f"{self.full_name} - {self.subject}"


# ---------------------------------------------------------------------------
# Placement Students
# ---------------------------------------------------------------------------
class PlacementStudent(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=200)
    batch = models.CharField(max_length=50)
    image = models.ImageField(upload_to='placements/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    # ✅ SEO meta tags
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name



class TeamMember(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    bio = models.TextField()
    image = models.ImageField(upload_to='team_images/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name
    





from django.db import models
from django.utils.text import slugify

class Course(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)

    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    duration = models.CharField(max_length=50, help_text="e.g., 1h 35m")
    level = models.CharField(max_length=50, default="Beginner")

    description = models.TextField(help_text="Short summary for the course card")
    overview = RichTextField(help_text="Full course overview (CKEditor)")
    modules = models.JSONField(
        default=list,
        blank=True,
        help_text="Add modules as a list of JSON objects.",
    )
    order = models.PositiveIntegerField(default=0)

    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1

            while Course.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title




class Technology(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='technologies/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Technologies"

    def __str__(self):
        return self.title



class Testimonial(models.Model):
    name = models.CharField(max_length=150)
    message = models.TextField(help_text="The testimonial text")
    image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Testimonials"

    def __str__(self):
        return self.name


class HireEnquiry(models.Model):
    company_name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    # ✅ JSONField handles the list of roles perfectly
    job_roles = models.JSONField(default=list, help_text="List of job roles")
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name_plural = "Hire Enquiries"

    def __str__(self):
        return f"{self.company_name} - {self.contact_person}"



from django.db import models

# ... (your other models) ...
class Career(models.Model):
    category = models.CharField(max_length=150, help_text="e.g. Business Development")
    title = models.CharField(max_length=200)
    experience = models.CharField(max_length=100, help_text="e.g. 4+ Years of experience")
    
    # ✅ Rich Text Fields for CKEditor
    description = RichTextField(help_text="Job description")
    responsibilities = RichTextField(help_text="Key responsibilities")
    requirements = RichTextField(help_text="Requirements")
    
    order = models.PositiveIntegerField(default=0)
    applications = models.JSONField(default=list, blank=True)

    # ✅ SEO Meta Tags
    meta_title = models.CharField(max_length=60, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name_plural = "Careers"

    def __str__(self):
        return f"{self.title} ({self.category})"



class CallbackRequest(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-submitted_at"]
        verbose_name_plural = "Callback Requests"

    def __str__(self):
        return f"{self.name} - {self.phone}"