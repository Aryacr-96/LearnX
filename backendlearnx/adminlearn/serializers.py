from rest_framework import serializers
from .models import Blog, CallbackRequest, Career, ContactMessage, Course, Gallery, HireEnquiry, PlacementStudent, SiteSettings, TeamMember, Technology, Testimonial, PageSEO


class BlogSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Blog
        fields = [
            'id', 'title', 'slug', 'image', 'uploaded_at', 'views', 'description',
        ]
        read_only_fields = ['id', 'slug', 'uploaded_at', 'views']


class GallerySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    video = serializers.FileField(required=False, allow_null=True)
    youtube_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Gallery
        fields = ["id", "title", "image", "video", "youtube_url", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ["id", "submitted_at", "is_read"]


class PlacementStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlacementStudent
        fields = ['id', 'name', 'role', 'batch', 'image', 'order']


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'role', 'bio', 'image', 'order']


class CourseSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'image', 'duration', 'level',
            'description', 'overview', 'modules', 'order',
        ]
        read_only_fields = ['slug']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            representation['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        else:
            representation['image'] = None
        return representation


class TechnologySerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Technology
        fields = ['id', 'title', 'image', 'order']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            representation['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        else:
            representation['image'] = None
        return representation


class TestimonialSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'message', 'image', 'order']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            representation['image'] = request.build_absolute_uri(instance.image.url) if request else instance.image.url
        else:
            representation['image'] = None
        return representation


class HireEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = HireEnquiry
        fields = "__all__"
        read_only_fields = ["id", "submitted_at", "is_read"]


class CareerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Career
        fields = [
            'id', 'category', 'title', 'experience', 
            'description', 'responsibilities', 'requirements', 
            'order', 'applications'
        ]
        read_only_fields = ["applications"]


class CallbackRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallbackRequest
        fields = "__all__"
        read_only_fields = ["id", "submitted_at", "is_read"]


class PageSEOSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSEO
        fields = "__all__"





class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'